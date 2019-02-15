/**
 * Represents an entity that can be notified of list modifications.
 */
export interface ListObserver<T> {
    /**
     * Called to notify about the items of some `List` being spliced.
     *
     * @param start Index at which splice begins.
     * @param deleteCount Number of items removed from and including `start`.
     * @param items Number of window items inserted at `start`.
     */
    onSplice(start: number, deleteCount: number, ...items: T[]): void;
}