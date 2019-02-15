import {ListObserver} from "./ListObserver";
import {Observable} from "./Observable";

/**
 * A list of items.
 */
export interface List<T> extends Observable<ListObserver<T>> {
    /**
     * Attempts to acquire item at provided list position.
     *
     * @param index Position in list of desired item.
     * @return Desired item, or `undefined` if not available.
     */
    item(index: number): T | undefined;

    /**
     * @return Iterator over list items.
     */
    items(): IterableIterator<T>;

    /**
     * @return Number of items in list.
     */
    length(): number;

    /**
     * Attempts to acquire a copy of a subsection of the list, or all of it.
     *
     * @param start Position at which to begin item extraction, or `0`.
     * @param end Position right before end of item extraction, or `this.length()`.
     * @return Promise of a new array containing the extracted items.
     */
    slice(start?: number, end?: number): T[];

    /**
     * Attempts to splice list.
     *
     * @param start Index at which splice begins.
     * @param deleteCount Number of items removed from and including `start`.
     * @param items Number of window items inserted at `start`.
     */
    splice(start: number, deleteCount: number, ...items: T[]): void;
}