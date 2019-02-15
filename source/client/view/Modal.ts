/**
 * Base class for modal views.
 */
export abstract class Modal<T> {
    private closer: (() => void) | undefined;

    /**
     * Closes modal view.
     */
    public close() {
        if (this.closer !== undefined) {
            this.closer();
        }
    }

    /**
     * Shows modal view until closed.
     */
    public open(): Promise<T> {
        return new Promise(((resolve, reject) => {
            const $modal = document.createElement("div");
            $modal.classList.add("en-modal");
            $modal.appendChild(this._render());

            const close = () => {
                window.removeEventListener("click", clickListener);
                window.removeEventListener("keypress", keyDownListener);
                this._close()
                    .then((value: T) => {
                        $modal.remove();
                        document.body.classList.remove("modal");
                        resolve(value);
                    })
                    .catch(reject);
            };

            let clickListener: (this: Window, event: MouseEvent) => any;
            let keyDownListener: (this: Window, event: KeyboardEvent) => any;

            clickListener = (event) => {
                if (event.target === $modal) {
                    close();
                }
            };

            keyDownListener = (event) => {
                switch (event.key) {
                case "Cancel":
                case "Escape":
                    close();
                    break;
                default:
                    break;
                }
            };

            window.addEventListener("click", clickListener);
            window.addEventListener("keydown", keyDownListener);

            document.body.classList.add("modal");
            document.body.appendChild($modal);
            const $focusable = $modal.querySelector("button, input");
            if ($focusable instanceof HTMLElement) {
                $focusable.focus();
            }

            this.closer = close;
        }));
    }

    /**
     * Called right before being closed.
     *
     * @private
     */
    protected abstract _close(): Promise<T>;

    /**
     * Renders `HTMLElement` to be placed inside modal.
     *
     * @private
     */
    protected abstract _render(): HTMLElement;
}