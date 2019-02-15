import {isCall} from "./Call";
import {Error as _Error, isError} from "./Error";
import {ErrorCode} from "./ErrorCode";
import {isMessage} from "./Message";
import {isNotification, Notification} from "./Notification";
import {isRequest, Request} from "./Request";
import {isResponse} from "./Response";
import {isResponseError, ResponseError} from "./ResponseError";
import {isResponseResult, ResponseResult} from "./ResponseResult";
import {SocketCallback} from "./SocketCallback";
import {SocketObserver} from "./SocketObserver";
import {Observable} from "../util";

type ID = number | string;
type RequestCallback = (result: any, error?: _Error) => void;

/**
 * A socket through which remote procedure calls can be sent and received.
 */
export abstract class Socket extends Observable<SocketObserver> {
    private readonly requests: Map<ID, RequestCallback> = new Map();
    private callback: SocketCallback | undefined;
    private id: number = (Math.random() * (Number.MAX_SAFE_INTEGER / 2.0)) | 0;

    /**
     * Creates new abstract JSON-RPC 2.0 socket.
     *
     * @param timeout Time, in seconds, after which requests not yet responded
     *                to are dropped.
     */
    protected constructor(protected readonly timeout: number) {
        super();
    }

    /**
     * Closes socket.
     *
     * # Silent
     *
     * Calling this function does not cause a `"close"` event to be raised.
     *
     * @returns Promise of close completion.
     */
    public abstract close(): Promise<void>;

    /**
     * Submits request to invoke a named procedure that returns nothing.
     *
     * @param method Name of remote procedure to call.
     * @param params Any provided arguments.
     * @returns Promise of call being sent.
     */
    public notify(method: string, ...params: any[]): Promise<void> {
        return this.sendAsJSON({jsonrpc: "2.0", method, params} as Notification);
    }

    /**
     * Submits request to invoke a named procedure.
     *
     * @param method Name of remote procedure to call.
     * @param params Any provided arguments.
     * @returns Promise of call return value.
     */
    public async request(method: string, ...params: any[]): Promise<any> {
        let id = this.id++;
        if (id > Number.MAX_SAFE_INTEGER) {
            id = this.id = 0;
        }
        await this.sendAsJSON({jsonrpc: "2.0", method, params, id} as Request);
        return await new Promise((resolve, reject) => {
            this.requests.set(id, (result, error) => {
                this.requests.delete(id);
                if (result !== undefined) {
                    resolve(result);
                }
                else {
                    reject(error);
                }
            });
            setTimeout(() => {
                this.requests.delete(id);
                reject(_Error.TIMEOUT);
            }, (this.timeout * 1000) | 0);
        });
    }

    /**
     * Set socket callback, which is responsible for handling incoming requests
     * and notifications.
     *
     * If the callback returns an `Error` or throws an error, the host invoking
     * the callback is replied to with an internal error code without any
     * details about the error. If, on the other hand, the callback returns a
     * value of type `SocketError`, the information in that object is provided
     * to the calling host.
     *
     * @param callback Function to receive incoming calls.
     */
    public setCallback(callback: SocketCallback) {
        this.callback = callback;
    }

    /**
     * Method to be called by extending class to notify about the socket being
     * closed.
     *
     * @param error Any error causing socket being closed.
     */
    protected onClose(error?: any) {
        this.forEachSubscriber(s => s.onClose(error));
    }

    /**
     * Method to be called by extending class to notify about an error being
     * encountered that does not force the socket to close.
     *
     * @param error Error.
     */
    protected onError(error: any) {
        this.forEachSubscriber(s => s.onError(error));
    }

    /**
     * Method to be called by extending class to notify about the socket being
     * open/connected.
     */
    protected onOpen() {
        this.forEachSubscriber(s => s.onOpen());
    }

    /**
     * Method to be called by extending class to notify about each incoming
     * message.
     *
     * Incoming requests and notifications will be delegated to whatever
     * callback has been registered via `this.setCallback()`, while any
     * responses will be matched against any pending requests. Unexpected or
     * invalid messages are responded to immediately.
     *
     * @param text Raw message string.
     */
    protected async onReceive(text: string): Promise<void> {
        try {
            let message: object;
            try {
                message = JSON.parse(text);
            }
            catch {
                return await this.replyWithError(null, _Error.PARSE_ERROR);
            }
            let id = (<any>message).id;
            if (id === undefined) {
                id = null;
            }
            else if (!isID(id)) {
                return await this.replyWithError(null, {
                    code: ErrorCode.INVALID_REQUEST,
                    message: "`id` must be a number, string, null or absent",
                    data: {id},
                });
            }
            if (!isMessage(message)) {
                return await this.replyWithError(id, {
                    code: ErrorCode.INVALID_REQUEST,
                    message: "`jsonrpc != \"2.0\"`",
                });
            }
            if (isCall(message)) {
                if (isNotification(message)) {
                    return await this.onNotification(message);
                }
                if (isRequest(message)) {
                    return await this.onRequest(message);
                }
            }
            else if (isResponse(message)) {
                if (isResponseError(message)) {
                    return await this.onResponseError(message);
                }
                if (isResponseResult(message)) {
                    return await this.onResponseResult(message);
                }
            }
            await this.replyWithError(id, _Error.INVALID_REQUEST);
        }
        catch (error) {
            this.onError(error);
        }

        function isID(id: any): id is (number | string) {
            switch (typeof id) {
                case "number":
                case "string":
                    return true;

                default:
                    return false;
            }
        }
    }

    private async onNotification(call: Notification): Promise<void> {
        if (this.callback === undefined) {
            throw new Error("No socket callback set");
        }
        await this.callback(call.method, ...(call.params || []));
    }

    private async onRequest(call: Request): Promise<void> {
        if (this.callback === undefined) {
            throw new Error("No socket callback set");
        }
        const result = await this.callback(call.method, ...(call.params || []));
        if (isError(result)) {
            await this.replyWithError(call.id, result);
        }
        else {
            await this.replyWithResult(call.id, result);
        }
    }

    private async onResponseError(response: ResponseError): Promise<void> {
        if (response.id === null) {
            this.onError(response.error);
            return;
        }
        const request = this.requests.get(response.id);
        if (request === undefined) {
            await this.replyWithError(
                response.id,
                _Error.UNEXPECTED_RESPONSE
            );
            return;
        }
        request(undefined, response.error);
    }

    private async onResponseResult(response: ResponseResult): Promise<void> {
        const request = this.requests.get(response.id);
        if (request === undefined) {
            await this.replyWithError(
                response.id,
                _Error.UNEXPECTED_RESPONSE
            );
            return;
        }
        request(response.result);
    }

    private replyWithError(id: null | ID, error: _Error): Promise<void> {
        return this.sendAsJSON({jsonrpc: "2.0", error, id} as ResponseError);
    }

    private replyWithResult(id: ID, result: any): Promise<void> {
        if (result === undefined) {
            result = null;
        }
        return this.sendAsJSON({jsonrpc: "2.0", result, id} as ResponseResult);
    }

    private sendAsJSON(object: object): Promise<void> {
        return this.send(JSON.stringify(object));
    }

    /**
     * Method provided by extending class for sending encoded texts to the host
     * at the other end of the socket.
     *
     * @param text Raw message string.
     * @return Promise of message being sent.
     */
    protected abstract send(text: string): Promise<void>;
}