/**
 * Represent some entity that can be rendered as an HTML element.
 */
export abstract class Widget {
    private $element: HTMLElement | undefined;

    protected constructor(protected className?: string) {}

    /**
     * Highlights `View` temporarily and scrolls it into view, if supported.
     */
    public focus(scrollIntoView = true) {
        if (this.$element === undefined) {
            return;
        }
        if (scrollIntoView && Element.prototype["scrollIntoView"] !== undefined) {
            this.$element.scrollIntoView({behavior: "smooth"});
        }
        this.$element.classList.add("focused");
        setTimeout(() => {
            if (this.$element !== undefined) {
                this.$element.classList.remove("focused");
            }
        }, 2000);
    }

    public isRendered(): boolean {
        return this.$element !== undefined;
    }

    /**
     * Removes any `HTMLElement` returned via `this.render()` from the DOM.
     */
    public remove() {
        if (this.$element !== undefined) {
            this.$element.remove();
        }
    }

    /**
     * Creates `HTMLElement` representing this object, or returns a cached
     * reference to such a representation.
     */
    public render(): HTMLElement {
        if (this.$element === undefined) {
            this.$element = this._render();
            if (this.className !== undefined) {
                this.$element.classList.add(this.className);
            }
        }
        return this.$element;
    }

    protected abstract _render(): HTMLElement;
}