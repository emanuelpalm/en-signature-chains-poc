import {Socket} from "./Socket";

export interface SocketSourceObserver {
    /**
     * Notifies about socket source being closed.
     *
     * @param error Error cause of forcing source shutdown, if any.
     */
    onClose(error?: any): void;

    /**
     * Notifies about some `Error` preventing socket source from operating
     * normally.
     *
     * This method is never called in response to errors making a socket source
     * having to close. In that case `onClose()` is called with an error.
     *
     * @param error Socket source error.
     */
    onError(error: any): void;

    /**
     * Notifies about a new socket being available.
     *
     * @param socket RPC socket.
     */
    onSocket(socket: Socket): void;
}