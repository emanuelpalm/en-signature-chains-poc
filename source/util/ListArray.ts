import {Observable} from "./Observable";
import {ListObserver} from "./ListObserver";
import {List} from "./List";

/**
 * A `List` backed internally by a regular `Array`.
 */
export class ListArray<T> extends Observable<ListObserver<T>> implements List<T> {
    public constructor(private array: T[] = []) {
        super();
    }

    public indexOf(searchElement: T, fromIndex?: number): number {
        return this.array.indexOf(searchElement, fromIndex);
    }

    public item(index: number): T | undefined {
        return this.array[index];
    }

    public items(): IterableIterator<T> {
        return this.array[Symbol.iterator]();
    }

    public length(): number {
        return this.array.length;
    }

    public map<U>(callbackfn: (value: T) => U): List<U> {
        return new ListArray(this.array.map(callbackfn));
    }

    public push(...items: T[]) {
        this.splice(this.array.length, 0, ...items);
    }

    public shift(...items: T[]) {
        this.splice(0, 0, ...items);
    }

    public slice(start?: number, end?: number): T[] {
        return this.array.slice(start, end);
    }

    public splice(start: number, deleteCount: number, ...items: T[]): void {
        if (start > this.array.length) {
            start = this.array.length;
        }
        if (start + deleteCount > this.array.length) {
            deleteCount = Math.max(this.array.length - start, 0);
        }
        this.array.splice(start, deleteCount, ...items);
        this.forEachSubscriber(s => s.onSplice(start, deleteCount, ...items));
    }
}