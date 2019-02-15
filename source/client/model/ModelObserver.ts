/**
 * Represents an entity that can be notified of model state changes.
 */
export interface ModelObserver {
    /**
     * Called to notify about the model being connected to a client.
     */
    onConnected(): void,

    /**
     * Called to notify about the model not being connected to a client.
     *
     * @param error Error causing disconnect, if any.
     */
    onDisconnected(error?: any): void;
}