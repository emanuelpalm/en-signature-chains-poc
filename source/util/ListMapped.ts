import {Observable} from "./Observable";
import {ListObserver} from "./ListObserver";
import {List} from "./List";

export class ListMapped<T, U extends object>
    extends Observable<ListObserver<U>>
    implements List<U>
{
    private readonly convert: (item: T) => U;
    private readonly map: WeakMap<U, T> = new WeakMap();

    public constructor(
        private readonly list: List<T>,
        convert: (item: T) => U,
    )
    {
        super();
        this.convert = (item: T) => {
            const conversion = convert(item);
            this.map.set(conversion, item);
            return conversion;
        };
        list.subscribe({
            onSplice: (start, deleteCount, ...items) => {
                this.forEachSubscriber(s => {
                    s.onSplice(start, deleteCount, ...items.map(this.convert));
                });
            },
        });
    }

    public item(index: number): U | undefined {
        const item = this.list.item(index);
        return item !== undefined ? this.convert(item) : undefined;
    }

    public items(): IterableIterator<U> {
        const it = this.list.items();
        const f = this.convert;
        return function* () {
            let next;
            while (!(next = it.next()).done) {
                yield f(next.value);
            }
        }();
    }

    public length(): number {
        return this.list.length();
    }

    public slice(start?: number, end?: number): U[] {
        return this.list.slice(start, end).map(this.convert);
    }

    public splice(start: number, deleteCount: number, ...items: U[]): void {
        return this.list.splice(start, deleteCount,
            ...items.map(item => this.revert(item)));
    }

    private revert(item: U): T {
        return this.map.get(item) as T;
    }
}