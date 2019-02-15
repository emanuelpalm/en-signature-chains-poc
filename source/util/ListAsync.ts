import {ListObserver} from "./ListObserver";
import {Observable} from "./Observable";

/**
 * A list of items, where items may be fetched asynchronously as requested.
 */
export abstract class ListAsync<T> extends Observable<ListObserver<T>> {
    /**
     * Attempts to acquire item at provided list position.
     *
     * @param index Position in list of desired item.
     * @return Promise of desired item, or `undefined` if not available.
     */
    public abstract item(index: number): Promise<T | undefined>;

    /**
     * @return Iterator over list items.
     */
    public abstract items(): IterableIterator<Promise<T>>;

    /**
     * @return Number of items in list.
     */
    public abstract length(): number;

    /**
     * Attempts to acquire a copy of a subsection of the list, or all of it.
     *
     * @param start Position at which to begin item extraction, or `0`.
     * @param end Position right before end of item extraction, or `this.length()`.
     * @return Promise of a new array containing the extracted items.
     */
    public abstract slice(start?: number, end?: number): Promise<T[]>;

    /**
     * Attempts to splice list.
     *
     * @param start Index at which splice begins.
     * @param deleteCount Number of items removed from and including `start`.
     * @param items Number of window items inserted at `start`.
     */
    public abstract splice(start: number, deleteCount: number, ...items: T[]): Promise<void>;
}