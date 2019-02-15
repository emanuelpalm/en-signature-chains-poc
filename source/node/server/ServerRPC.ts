import {SocketRPC} from "./SocketRPC";
import * as http from "http";
import * as net from "net";
import * as rpc from "../../rpc-json";
import * as WebSocket from "ws";

/**
 * Takes HTTP(S) delegate requests and turns them into `SocketRPC` instances.
 */
export class ServerRPC extends rpc.SocketSource {
    private readonly server: WebSocket.Server;

    /**
     * Creates WebSocket request delegate router.
     */
    public constructor() {
        super();
        this.server = new WebSocket.Server({noServer: true});
        this.server.addListener("connection", (socket: WebSocket) => {
            const rpcSocket = new SocketRPC(socket);
            if (socket.readyState === WebSocket.OPEN) {
                this.forEachSubscriber(s => s.onSocket(rpcSocket));
                return;
            }
            const onError = (error: any) => {
                this.forEachSubscriber(s => s.onError(error));
            };
            const onOpen = () => {
                socket.removeListener("error", onError);
                socket.removeListener("open", onOpen);
                this.forEachSubscriber(s => s.onSocket(rpcSocket));
            };
            socket.addListener("error", onError);
            socket.addListener("open", onOpen);
        });
        this.server.addListener("error", (error) => {
            this.forEachSubscriber(s => s.onError(error));
        });
    }

    /**
     * Handles given incoming HTTP(S) upgrade request by attempting to establish
     * a WebSocket connection through which JSON-RPC 2.0 messages can be sent.
     *
     * @param request Incoming HTTP upgrade request.
     * @param socket Socket associated with `request`.
     * @param head The first packet of the upgraded stream.
     */
    public delegate(request: http.IncomingMessage, socket: net.Socket, head: Buffer) {
        const upgrade = request.headers.upgrade || "";
        if (upgrade.toLowerCase() !== "websocket") {
            return socket.end(
                "HTTP/1.1 426 Upgrade Required\r\n" +
                `Content-Length: ${23 + upgrade.length}\r\n` +
                "Content-Type: text/plain\r\n" +
                "Upgrade: WebSocket\r\n" +
                "\r\n" +
                `Unsupported protocol: ${upgrade}`
            );
        }
        this.server.handleUpgrade(request, socket, head, socket => {
            this.server.emit("connection", socket);
        });
    }

    /**
     * Closes router.
     */
    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close((error?: Error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
}