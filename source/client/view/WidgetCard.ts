import {Widget} from "./Widget";
import {LogBroker} from "./LogBroker";

export type ViewCardValue = string | Widget | { [k: string]: any };

export class WidgetCard extends Widget {
    private actions: HTMLButtonElement[] = [];
    private entries: [HTMLDivElement | undefined, HTMLDivElement][] = [];
    private state: string = "normal";
    private $nav: HTMLElement | undefined;

    public constructor(className?: string) {
        super(className);
    }

    public addAction(label: string, className?: string): this {
        const $button = document.createElement("button");
        if (className !== undefined) {
            $button.classList.add(className);
        }
        $button.textContent = label;
        if (this.isRendered() && this.$nav === undefined) {
            this.appendMenuTo(this.render());
        }
        if (this.$nav !== undefined) {
            this.$nav.appendChild($button);
        }
        this.actions.push($button);
        return this;
    }

    public addEntry(label?: string, className?: string): this {
        let $label = undefined;
        const $value = document.createElement("div");

        if (label !== undefined) {
            $label = document.createElement("div");
            $label.classList.add("label");
            if (className !== undefined) {
                $label.classList.add(className);
            }
            $label.textContent = label;
            $value.classList.add("value");
        }
        else {
            $value.classList.add("entry");
        }

        this.entries.push([$label, $value]);
        return this;
    }

    public clearActions(): this {
        if (this.$nav !== undefined) {
            this.$nav.remove();
            this.$nav = undefined;
        }
        if (this.isRendered()) {
            this.render().classList.remove("menu");
        }
        this.actions = [];
        return this;
    }

    public clearCallbacks(): this {
        for (const $button of this.actions) {
            $button.onclick = null;
        }
        return this;
    }

    public setAction(index: number, callback: () => Promise<void>): this {
        const $button = this.actions[index];
        if ($button === undefined) {
            throw new RangeError("No action with index: " + index);
        }
        $button.onclick = () => {
            for (const $button of this.actions) {
                $button.disabled = true;
            }
            callback().then(
                () => {
                    for (const $button of this.actions) {
                        $button.disabled = false;
                    }
                },
                error => LogBroker.instance().publish({
                    title: "Action Failed",
                    data: error,
                }),
            );
        };
        return this;
    }

    public setEntry(index: number, value?: ViewCardValue, className?: string): this {
        const entry = this.entries[index];
        if (entry === undefined) {
            throw new RangeError("No entry with index: " + index);
        }
        const $value = entry[1];
        $value.classList.remove("pairs");
        if (className !== undefined) {
            $value.classList.add(className);
        }
        if (value === undefined) {
            $value.textContent = "";
        }
        else if (typeof value === "string") {
            $value.textContent = value;
        }
        else if (value instanceof Widget) {
            $value.textContent = "";
            $value.appendChild(value.render());
        }
        else {
            $value.textContent = "";
            $value.classList.add("pairs");
            const names = Object.getOwnPropertyNames(value);
            for (const name of names) {
                const $label = document.createElement("div");
                $label.textContent = name;
                $value.appendChild($label);

                const $value0 = document.createElement("div");
                const value0 = value[name];
                $value0.textContent = typeof value0 === "string"
                    ? value0
                    : JSON.stringify(value0);
                $value.appendChild($value0);
            }
        }
        return this;
    }

    public setEntryLabel(index: number, label: string): this {
        const entry = this.entries[index];
        if (entry === undefined) {
            throw new RangeError("No entry with index: " + index);
        }
        const $label = entry[0];
        if ($label === undefined) {
            throw new Error("Entry with index " + index + " has no label.");
        }
        $label.textContent = label;
        return this;
    }

    public setState(name: string): this {
        if (this.isRendered()) {
            this.render()
                .classList
                .replace(this.state, name);
        }
        this.state = name;
        return this;
    }

    protected _render(): HTMLElement {
        const $root = document.createElement("div");
        $root.classList.add("en-card", this.state);

        const $entries = document.createElement("div");
        $entries.classList.add("entries");
        for (const [$label, $value] of this.entries) {
            if ($label !== undefined) {
                $entries.appendChild($label);
            }
            $entries.appendChild($value);
        }
        $root.appendChild($entries);

        if (this.actions.length > 0) {
            this.appendMenuTo($root);
        }

        return $root;
    }

    private appendMenuTo($root: HTMLElement) {
        $root.classList.add("menu");
        this.$nav = document.createElement("nav");
        for (const $button of this.actions) {
            this.$nav.appendChild($button);
        }
        $root.appendChild(this.$nav);
    }
}