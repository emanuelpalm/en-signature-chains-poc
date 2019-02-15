import {LinkBroker} from "./LinkBroker";
import {Widget} from "./Widget";
import {Model} from "../model";

/**
 * Widget representing the currently logged in user.
 */
export class WidgetMe extends Widget {
    /**
     * Creates new `WidgetMe`.
     *
     * @param model Widget data source.
     */
    public constructor(
        private readonly model: Model,
    ) {
        super();
    }

    protected _render(): HTMLElement {
        const $root = document.createElement("div");
        $root.classList.add("en-me");

        this.model.me().subscribe({
            onSplice: (start, deleteCount, ...items) => {
                if (start === 0 && (deleteCount > 0 || items.length > 0)) {
                    // Use timeout to ensure code is executed after any other
                    // collection subscribers.
                    setTimeout(() => {
                        const user = this.model.me().primary();
                        $root.textContent = user.name;
                        $root.onclick = () => {
                            LinkBroker.instance().publish("user", user.key);
                        };
                    });
                }
            },
        });

        return $root;
    }
}