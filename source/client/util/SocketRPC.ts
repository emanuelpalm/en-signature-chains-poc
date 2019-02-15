import * as rpc from "../../rpc-json";

/**
 * A socket for communicating with a remote host via JSON-RPC 2.0.
 *
 * This particular socket implementation automatically reconnects if the
 * connection is closed, until the `close()` method of the class is invoked.
 */
export class SocketRPC extends rpc.Socket {
    private socket: WebSocket;

    /**
     * Creates new JSON-RPC 2.0 socket.
     *
     * @param uri WebSocket URI to remote host. Begins with "ws://" or "wss://".
     * @param timeout Request timeout, in seconds.
     */
    public constructor(private readonly uri: string, timeout = 5.0) {
        super(timeout);

        let reconnectDelay = 0.25;
        const onConnect = () => {
            this.socket.onclose = event => {
                this._onClose(event);
                setTimeout(() => {
                    reconnectDelay *= 2;
                    if (reconnectDelay > timeout) {
                        reconnectDelay = timeout;
                    }
                    this.socket = new WebSocket(uri);
                    onConnect();
                }, (reconnectDelay * 1000) | 0);
            };
            this.socket.onmessage = event => this.onReceive(event.data).catch(error => {
                this.forEachSubscriber(s => s.onError(error));
            });
            this.socket.onopen = () => {
                this.onOpen();
                reconnectDelay = 0.25;
            };
        };

        this.socket = new WebSocket(uri);
        onConnect();
    }

    private _onClose(event: CloseEvent) {
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