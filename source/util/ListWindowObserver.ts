import {ListObserver} from "./ListObserver";

/**
 * Represents an entity that can be notified of list modifications.
 */
export interface ListWindowObserver<T> extends ListObserver<T> {
    /**
     * Called to notify about the window of some `ListWindow` being  spliced.
     *
     * @param start Window index at which splice begins.
     * @param deleteCount Number of items removed from and including `start`.
     * @param items Number of window items inserted at `start`.
     */
    onWindowSplice(start: number, deleteCount: number, ...items: T[]): void;
}