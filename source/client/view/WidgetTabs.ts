import {Widget} from "./Widget";

/**
 * A `<section>` with a title, tabs, and a body that changes when changing tab.
 */
export class WidgetTabs extends Widget {
    private readonly tabs: [string, Widget][];
    private readonly title: string;

    /**
     * Creates new tabs view.
     *
     * @param title Title label.
     * @param className Class name of view.
     * @param tabs Any desired tabs.
     */
    public constructor(title: string, className: string, ...tabs: [string, Widget][]) {
        super(className);
        this.tabs = tabs;
        this.title = title;
    }

    protected _render(): HTMLElement {
        const $section = document.createElement("section");

        let $currentButton: HTMLElement | undefined;
        let $currentView: HTMLElement | undefined;

        const $header = document.createElement("header");
        {
            const $h2 = document.createElement("h2");
            $h2.textContent = this.title;
            $header.appendChild($h2);
        }
        {
            const $nav = document.createElement("nav");
            if (this.tabs.length > 1) {
                for (const [name, view] of this.tabs) {
                    const $button = document.createElement("button");
                    $button.textContent = name;
                    $button.onclick = () => selectTab(view, $button);
                    if ($currentButton === undefined) {
                        $currentButton = $button;
                    }
                    $nav.appendChild($button);
                }
            }
            $header.appendChild($nav);
        }
        $section.appendChild($header);

        if (this.tabs.length > 0) {
            selectTab(this.tabs[0][1], $currentButton);
        }

        return $section;

        function selectTab(view: Widget, $button?: HTMLElement) {
            if ($currentView !== undefined) {
                $section.removeChild($currentView);
            }
            $currentView = view.render();
            $section.appendChild($currentView);

            if ($currentButton !== undefined) {
                $currentButton.classList.remove("selected");
            }
            if ($button !== undefined) {
                $currentButton = $button;
                $button.classList.add("selected");
            }
            else {
                $currentButton = undefined;
            }
        }
    }
}