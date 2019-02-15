import {Widget} from "./Widget";

/**
 * A `<section>` with a menu and body of multiple panes. When the menu changes,
 * the pane with the style `"selected"` is changed.
 */
export class WidgetPaneSelector extends Widget {
    private readonly buttons: HTMLElement[];
    private readonly panes: [string, Widget][];
    private readonly title: string;

    private $currentButton: HTMLElement | undefined;
    private $currentView: HTMLElement | undefined;
    private $header: HTMLElement | undefined;

    /**
     * Creates new panes view.
     *
     * @param title Title label.
     * @param className Class name of view.
     * @param panes Any desired child views.
     */
    public constructor(title: string, className: string, ...panes: [string, Widget][]) {
        super(className);
        this.buttons = [];
        this.panes = panes;
        this.title = title;
    }

    /**
     * Selects pane with given index.
     *
     * @param index Pane index.
     */
    public select(index: number) {
        this.selectPane(this.panes[index][1], this.buttons[index]);
    }

    protected _render(): HTMLElement {
        const $section = document.createElement("section");

        this.$header = document.createElement("header");
        {
            const $div = document.createElement("div");
            $div.onclick = () => {
                (this.$header as HTMLElement).classList.toggle("toggled");
            };
            $div.textContent = this.title;
            this.$header.appendChild($div);
        }
        {
            const $nav = document.createElement("nav");
            if (this.panes.length > 1) {
                for (const [name, view] of this.panes) {
                    const $button = document.createElement("button");
                    $button.textContent = name;
                    $button.onclick = () => this.selectPane(view, $button);
                    this.buttons.push($button);
                    $nav.appendChild($button);
                }
            }
            this.$header.appendChild($nav);
        }
        $section.appendChild(this.$header);

        for (const view of this.panes) {
            $section.appendChild(view[1].render());
        }
        if (this.panes.length > 0) {
            this.selectPane(this.panes[0][1], this.buttons[0]);
        }

        return $section;
    }

    private selectPane(pane: Widget, $button?: HTMLElement) {
        if (this.$header !== undefined) {
            this.$header.classList.remove("toggled");
        }

        if (this.$currentView !== undefined) {
            this.$currentView.classList.remove("selected");
        }
        this.$currentView = pane.render();
        this.$currentView.classList.add("selected");

        if (this.$currentButton !== undefined) {
            this.$currentButton.classList.remove("selected");
        }
        if ($button !== undefined) {
            this.$currentButton = $button;
            $button.classList.add("selected");
        }
        else {
            this.$currentButton = undefined;
        }
    }
}