import {Socket} from "./Socket";
import {SocketSource} from "./SocketSource";

/**
 * Notifies about `Router` events.
 */
export interface RouterObserver {
    /**
     * Notifies about a method throwing an error.
     *
     * @param name Name of method causing error.
     * @param error Thrown error.
     */
    onMethodError(name: string, error: any): void;

    /**
     * Notifies about a corresponding host closing an RPC socket.
     *
     * @param socket Closed socket.
     * @param error Indicates whether or not the cause of closing was an error.
     */
    onSocketClose(socket: Socket, error?: any): void;

    /**
     * Notifies about a socket error.
     *
     * This method is never invoked for errors which cause the socket to be
     * closed.
     *
     * @param socket Socket subject of error.
     * @param error Description of error.
     */
    onSocketError(socket: Socket, error: any): void;

    /**
     * Notifies about a socket becoming ready.
     *
     * @param socket Open socket.
     */
    onSocketOpen(socket: Socket): void;

    /**
     * Notifies about socket source being closed.
     *
     * @param source Closed socket source.
     * @param error Error cause of forcing source shutdown, if any.
     */
    onSourceClose(source: SocketSource, error?: any): void;

    /**
     * Notifies about some `Error` preventing socket source from operating
     * normally.
     *
     * This method is never called in response to errors making a socket source
     * having to close. In that case `onClose()` is called with an error.
     *
     * @param source Socket source subject of error.
     * @param error Socket source error.
     */
    onSourceError(source: SocketSource, error: any): void;
}