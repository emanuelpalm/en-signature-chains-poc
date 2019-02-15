import * as rpc from "../../rpc-json";
import * as WebSocket from "ws";

/**
 * A socket for communicating with some host via JSON-RPC 2.0 over WebSockets.
 */
export class SocketRPC extends rpc.Socket {
    private socket: WebSocket;

    /**
     * Creates new WebSockets/JSON-RPC 2.0 socket.
     *
     * @param socket WebSocket to wrap.
     * @param timeout
     */
    public constructor(socket: WebSocket, timeout = 10.0) {
        super(timeout);

        this.socket = socket;
        this.socket.onclose = event => this._onClose(event);
        this.socket.onmessage = event => this.onReceive(event.data.toString())
            .catch(error => {
                this.forEachSubscriber(s => s.onError(error));
            });
        this.socket.onopen = () => this.onOpen();
    }

    private _onClose(event: any) {
        let error: rpc.Error | undefined = undefined;
        if (event.code !== 1000) {
            error = {
                code: event.code,
                message: event.reason,
                data: {wasClean: event.wasClean},
            };
        }
        this.onClose(error);
    }

    public close(): Promise<void> {
        return new Promise(((resolve) => {
            this.socket.onclose = event => {
                this._onClose(event);
                resolve();
            };
            this.socket.close();
        }));
    }

    protected async send(text: string): Promise<void> {
        if (this.socket.readyState === WebSocket.CONNECTING) {
            await new Promise((resolve, reject) => {
                const openListener = () => {
                    this.socket.removeEventListener("open", resolve);
                    resolve();
                };
                this.socket.addEventListener("open", openListener);
                setTimeout(() => {
                    this.socket.removeEventListener("open", openListener);
                    reject(rpc.Error.TIMEOUT);
                }, (this.timeout * 1000) | 0);
            });
        }
        else if (this.socket.readyState !== WebSocket.OPEN) {
            throw rpc.Error.NOT_CONNECTED;
        }
        this.socket.send(text);
    }
}