import {Action} from "./Action";
import {Node} from "./Node";
import {xnet} from "../../../model";
import {Widget} from "../Widget";

export abstract class NodeLogic<T extends xnet.Expression>
    extends Widget
    implements Node<T>
{
    private readonly classNames: string[];

    protected constructor(...classNames: string[]) {
        super(classNames[0]);
        this.classNames = classNames.slice(1);
    }

    protected abstract actionsAddChild(): Action[];

    protected abstract actionsModify(): Action[];

    public abstract items(): Widget[];

    public abstract tokenize(): T;

    protected _render(): HTMLElement {
        const $root = document.createElement("div");
        $root.classList.add("node");
        for (const className of this.classNames) {
            $root.classList.add(className);
        }

        // Add node children.
        {
            const $items = document.createElement("div");
            $items.classList.add("items");
            for (const item of this.items()) {
                $items.appendChild(item.render());
            }
            $root.appendChild($items);
        }

        // Add node modification menu, if any.
        {
            const actionsModify = this.actionsModify();
            if (actionsModify.length > 0) {
                const $button = document.createElement("button");
                $button.classList.add("modify");
                $root.appendChild($button);
                Action.appendHTMLMenu($root, $button, ...actionsModify);
            }
        }

        // Add node child menu, if any.
        {
            const actionsAddChild = this.actionsAddChild();
            if (actionsAddChild.length > 0) {
                const $div = document.createElement("div");
                $div.classList.add("add-child");

                const $button = document.createElement("button");
                $div.appendChild($button);

                Action.appendHTMLMenu($div, $div, ...actionsAddChild);
                $root.appendChild($div);
            }
        }

        return $root;
    }
}