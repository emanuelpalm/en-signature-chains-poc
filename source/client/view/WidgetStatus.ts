import {Widget} from "./Widget";

/**
 * A status indicator.
 */
export class WidgetStatus extends Widget {
    /**
     * Creates new `ViewLink`.
     *
     * @param label Text describing status.
     * @param className Name of CSS class representing current status.
     */
    public constructor(private label: string, className: string) {
        super(className);
    }

    /**
     * Set a new status.
     *
     * @param label Description of status.
     * @param className Name of CSS class representing status.
     */
    public set(label: string, className: string) {
        if (this.isRendered()) {
            const $div = this.render();
            $div.classList.replace(this.className as string, className);
            $div.textContent = label;
        }
        this.label = label;
        this.className = className;
    }

    protected _render(): HTMLElement {
        const $div = document.createElement("div");
        $div.classList.add("en-status", this.className as string);
        $div.textContent = this.label;
        return $div;
    }
}