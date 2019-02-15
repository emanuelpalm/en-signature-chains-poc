import {List} from "./List";
import {ListAsync} from "./ListAsync";
import {ListObserver} from "./ListObserver";
import {Observable} from "./Observable";

/**
 * Caches all items of some `ListAsync`, and updates them when they change.
 */
export class ListCached<T> extends Observable<ListObserver<T>> implements List<T> {
    private readonly _origin: ListAsync<T>;
    private _cache: T[];

    /**
     * Creates new `ListCached`.
     *
     * @param origin The list from which cached items are to be retrieved.
     */
    public constructor(origin: ListAsync<T>) {
        super();
        this._origin = origin;
        this._cache = [];

        origin.subscribe({
            onSplice: async (start, deleteCount, ...items) => {
                this._cache.splice(start, deleteCount, ...items);
                this.forEachSubscriber(s => s.onSplice(start, deleteCount, ...items));
            },
        });
    }

    public item(index: number): T | undefined {
        return this._cache[index];
    }

    public items(): IterableIterator<T> {
        return this._cache[Symbol.iterator]();
    }

    public length(): number {
        return this._cache.length;
    }

    public slice(start?: number, end?: number): T[] {
        return this._cache.slice(start, end);
    }

    public splice(start: number, deleteCount: number, ...items: T[]) {
        this._cache.splice(start, deleteCount, ...items);
        this.forEachSubscriber(s => s.onSplice(start, deleteCount, ...items));
    }

    /**
     * @return The list from which this cache is derived.
     */
    public origin(): ListAsync<T> {
        return this._origin;
    }

    /**
     * Retrieves all items from origin, empties the cache, and inserts
     * retrieved items.
     *
     * @return Promise of operation resolution or rejection.
     */
    public async refresh(): Promise<void> {
        const length = this._cache.length;
        this._cache = await this._origin.slice();
        this.forEachSubscriber(s => {
            s.onSplice(0, length, ...this._cache)
        });
    }
}