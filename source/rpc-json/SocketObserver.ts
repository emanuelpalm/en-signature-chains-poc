/**
 * Notifies about `Socket` events.
 */
export interface SocketObserver {
    /**
     * Called to notify about the host at the other end closing the RPC socket.
     *
     * @param error Indicates whether or not the cause of closing was an error.
     */
    onClose(error?: any): void;

    /**
     * Called to notify about a socket error.
     *
     * This method is never invoked for errors which cause the socket to be
     * closed.
     *
     * @param error Error description.
     */
    onError(error: any): void;

    /**
     * Called to notify about the socket being ready.
     */
    onOpen(): void;
}