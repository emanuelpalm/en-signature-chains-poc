import {LinkBroker} from "./LinkBroker";
import {Widget} from "./Widget";

/**
 * A link publishing `LinkBroker` event when clicked.
 */
export class WidgetLink extends Widget {
    /**
     * Creates new `ViewLink`.
     *
     * @param label Text describing link.
     * @param command Link command.
     * @param args Function collecting any link command arguments.
     */
    public constructor(
        private readonly label: string,
        private readonly command: string,
        private readonly args: string[] = [],
    ) {
        super();
    }

    protected _render(): HTMLElement {
        const $a = document.createElement("a");
        $a.classList.add("en-link", this.command);
        $a.textContent = this.label;
        $a.onclick = () => {
            LinkBroker.instance().publish(this.command, ...this.args);
        };
        return $a;
    }
}