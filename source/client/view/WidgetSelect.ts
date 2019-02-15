import {Widget} from "./Widget";

/**
 * A widget showing options when clicked, allowing one option to be selected.
 */
export class WidgetSelect<T> extends Widget {
    private readonly subscribers: Set<(value: T | undefined) => void> = new Set();
    private readonly _options: T[];

    private $empty: HTMLElement | undefined;
    private _selectedIndex: number;

    public constructor(
        private readonly name: (option: T) => string,
        options: T[],
        selectedIndex = -1,
        className?: string
    )
    {
        super(className);
        this._options = options;
        this._selectedIndex = selectedIndex;
    }

    /**
     * Opens widget, making its options visible.
     *
     * If the widget is not yet rendered, calling this method does nothing.
     */
    public open() {
        if (this.isRendered()) {
            this.render().click();
        }
    }

    /**
     * The currently selected option, or undefined if nothing is selected.
     */
    public value(): T | undefined {
        return this._options[this._selectedIndex];
    }

    /**
     * Sets the currently selected option to that identified by given `index`.
     *
     * @param index Position of selected option in list of options.
     */
    public setSelectedOptionIndex(index: number) {
        index = Math.max(0, Math.min(this._options.length - 1, index));
        if (this.isRendered()) {
            const $root = this.render();
            if (this._selectedIndex !== -1) {
                $root.children[this._selectedIndex].classList.remove("selected");
            }
            $root.children[index].classList.add("selected");
        }
        this._selectedIndex = index;
    }

    protected _render(): HTMLElement {
        const $root = document.createElement("ul");
        $root.classList.add("en-select");
        $root.tabIndex = -1;

        const onClick = () => {
            $root.classList.add("open");
            $root.onclick = null;

            let close: Function;
            const onClickAgain = (event: Event) => {
                if (!(event.target instanceof Element)) {
                    return;
                }
                if ($root.contains(event.target)) {
                    const index = getElementIndex(event.target);
                    this.setSelectedOptionIndex(index);
                }
                close();
            };
            const onKeyDown = (event: KeyboardEvent) => {
                switch (event.key) {
                case "Enter":
                case "Accept":
                    close();
                    break;

                case "ArrowUp":
                case "ArrowLeft":
                    this.setSelectedOptionIndex(this._selectedIndex - 1);
                    break;

                case "ArrowDown":
                case "ArrowRight":
                    this.setSelectedOptionIndex(this._selectedIndex + 1);
                    break;

                default:
                    // Do nothing.
                    break;
                }
            };
            close = () => {
                $root.classList.remove("open");
                $root.onclick = onClick;

                window.removeEventListener("click", onClickAgain);
                window.removeEventListener("keydown", onKeyDown);

                const value = this.value();
                this.forEachSubscriber(s => s(value));

                if (this._selectedIndex !== -1 && this.$empty !== undefined) {
                    this.$empty.remove();
                    this.$empty = undefined;
                }
            };
            setTimeout(() => {
                window.addEventListener("click", onClickAgain);
                window.addEventListener("keydown", onKeyDown);
            });
        };
        $root.onclick = onClick;

        for (const option of this._options) {
            const $li = document.createElement("li");
            $li.textContent = this.name(option);
            $root.appendChild($li);
        }

        if (this._selectedIndex >= 0 && this._selectedIndex < this._options.length) {
            $root.children[this._selectedIndex].classList.add("selected");
        }
        else {
            const $li = document.createElement("li");
            $li.classList.add("empty");
            $root.appendChild($li);
            this.$empty = $li;
        }

        return $root;
    }

    /**
     * @param subscriber Entity to receive published data.
     */
    public subscribe(subscriber: (value: T | undefined) => void): void {
        this.subscribers.add(subscriber);
    }

    /**
     * @param subscriber Entity to no longer receive published data.
     * @return Whether or not `subscriber` was subscribing.
     */
    public unsubscribe(subscriber: (value: T | undefined) => void): boolean {
        return this.subscribers.delete(subscriber);
    }

    /**
     * Provides each subscriber to given function `f`.
     *
     * @param f Function invoked with each current subscriber.
     */
    protected forEachSubscriber(f: (subscriber: (value: T | undefined) => void) => void) {
        for (const subscriber of this.subscribers) {
            f(subscriber);
        }
    }
}

function getElementIndex($element: Element) {
    let index = 0;
    let $element0: Element | null = $element;
    while (($element0 = $element0.previousElementSibling) !== null) {
        index++;
    }
    return index;
}