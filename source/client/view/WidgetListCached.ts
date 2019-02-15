import {Widget} from "./Widget";
import {ListCached} from "../../util";

/**
 * A `View` that represents an ordered collection of arbitrary items.
 */
export abstract class WidgetListCached<T, U extends Widget> extends Widget {
    private readonly $body: HTMLElement;
    private readonly classNames: string[];
    private views: U[];

    /**
     * Creates new collection view from given observable `list`.
     *
     * @param list List to present.
     * @param tagName Tag name of root HTML element to host `list` items.
     * @param classNames Class names to add to the root HTML element.
     */
    protected constructor(
        private readonly list: ListCached<T>,
        private readonly tagName: string = "section",
        ...classNames: string[]
    )
    {
        super();
        this.$body = document.createElement("div");
        this.$body.classList.add("body");
        this.classNames = classNames;
        this.views = [];
    }

    protected item(index: number): U | undefined {
        return this.views[index];
    }

    /**
     * @return A new uninitialized HTML element for a single item.
     */
    protected abstract onItemCreate(): U;

    /**
     * Performs any clean-up required right before the HTML element
     * representing some item is removed from the root element.
     *
     * @param view HTML element about to be removed.
     */
    protected abstract onItemRemove(view: U): void;

    /**
     * Initializes an already created HTML element for a particular item.
     *
     * Note that the same element may have been used to represent some other
     * item before this method was called.
     *
     * @param view Item to initialize.
     * @param item Item to be represented by `view`.
     */
    protected abstract onItemUpdate(view: U, item: T): void;

    protected _render(): HTMLElement {
        const $root = document.createElement(this.tagName);
        $root.classList.add(...this.classNames);

        if (this.renderHeader !== undefined) {
            $root.appendChild(this.renderHeader($root));
        }

        this.views = new Array(this.list.length());
        let i = 0;
        for (const item of this.list.items()) {
            const view = this.onItemCreate();
            this.onItemUpdate(view, item);
            this.views[i++] = view;
            this.$body.appendChild(view.render());
        }

        this.list.subscribe({
            onSplice: (start, deleteCount, ...items) => {
                let i = 0;
                let updateCount = Math.min(
                    deleteCount, items.length, this.views.length - start
                );
                while (updateCount-- > 0) {
                    this.onItemUpdate(this.views[start++], items[i++]);
                    deleteCount--;
                }
                while (deleteCount-- > 0) {
                    if (start >= this.views.length) {
                        break;
                    }
                    const view = this.views.splice(start, 1)[0];
                    this.onItemRemove(view);
                    view.remove();
                }
                while (i < items.length) {
                    const view = this.onItemCreate();
                    this.onItemUpdate(view, items[i++]);

                    const $view = view.render();
                    if (start < this.$body.children.length) {
                        this.$body.insertBefore($view, this.$body.children[start]);
                        this.views.splice(start, 0, view);
                    }
                    else {
                        this.$body.appendChild($view);
                        this.views.push(view);
                    }
                    start++;
                }
            },
        });

        $root.appendChild(this.$body);

        if (this.renderFooter !== undefined) {
            $root.appendChild(this.renderFooter($root));
        }

        return $root;
    }

    /**
     * Any HTMLElement to include at beginning of list.
     */
    protected abstract renderHeader?($root: HTMLElement): HTMLElement;

    /**
     * Any HTMLElement to include at end of list.
     */
    protected abstract renderFooter?($root: HTMLElement): HTMLElement;
}
