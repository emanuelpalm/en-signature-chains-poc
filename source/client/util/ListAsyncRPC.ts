import * as rpc from "../../rpc-json";
import * as util from "../../util";

/**
 * An asynchronous list, loading items on demand via a JSON-RPC 2.0 socket.
 */
export class ListAsyncRPC<T> extends util.ListAsync<T> {
    private _length: number = 0;

    /**
     * Creates new asynchronous list using JSON-RPC 2.0 to fetch and store
     * items.
     *
     * In particular, the host at the other end of `socket` is assumed to
     * provide the RPC methods `name`.slice and `name`.splice. If `name` would
     * be "a", then would the called methods be "a.slice" and "a.splice". The
     * functions have the same signatures as their Array.prototype counterparts.
     *
     * @param socket Socket to use for requesting items.
     * @param name List resource name.
     * @param verifier Function used to verify received items are correct, if any.
     */
    public constructor(
        private readonly socket: rpc.Socket,
        private readonly name: string,
        private readonly verifier?: (value: any) => value is T,
    )
    {
        super();
    }

    public item(index: number): Promise<T | undefined> {
        return this.slice(index, index + 1)
            .then(slice => slice[0]);
    }

    public items(): IterableIterator<Promise<T>> {
        let self = this;
        return function* () {
            for (let i = 0; i < self.length(); ++i) {
                yield self.item(i).then(item => item as T);
            }
        }();
    }

    public length(): number {
        return this._length;
    }

    public async slice(begin?: number, end?: number): Promise<T[]> {
        if (begin !== undefined && end !== undefined && begin >= end) {
            throw new RangeError(`${begin} >= ${end}`);
        }
        const method = `${this.name}.slice`;
        const data = await this.socket.request(method, begin, end);
        if (this.verify(data)) {
            this._length = data.length;
            return data.slice;
        }
        throw new Error("Bad JSON-RPC 2.0 socket result: " + JSON.stringify(data));
    }

    private verify(data: any): data is { length: number, slice: T[] } {
        return typeof data === "object"
            && typeof data.length === "number"
            && Array.isArray(data.slice)
            && (this.verifier === undefined || data.slice.find((item: any) => {
                return !(this.verifier as (value: any) => value is T)(item)
            }) === undefined);
    }

    public async splice(start: number, deleteCount: number, ...items: T[]): Promise<void> {
        const method = `${this.name}.splice`;
        await this.socket.request(method, start, deleteCount, items);
        this._length += items.length - deleteCount;
    }
}