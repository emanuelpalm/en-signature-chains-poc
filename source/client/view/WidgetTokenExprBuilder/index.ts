import {Action} from "./Action";
import {Model} from "../../model";
import {Node} from "./Node";
import {nodeFromExpr} from "./nodeFromExpr";
import {User, xnet} from "../../../model";
import {Widget} from "../Widget";

export class WidgetTokenExprBuilder extends Widget {
    private $root: HTMLElement;
    private root: Node<xnet.Expression> | undefined;

    public constructor(model: Model, expr: xnet.Expression, owner?: User) {
        super("en-token-expr-builder");
        this.$root = document.createElement("div");

        const context = {model, owner};
        const onUpdate = (expr: xnet.Expression) => {
            this.root = nodeFromExpr(context, onUpdate, expr);
            this.$root.textContent = "";
            if (this.root !== undefined) {
                this.$root.appendChild(this.root.render());
            }
            else {
                const $div = document.createElement("div");
                $div.classList.add("add-child");

                const $button = document.createElement("button");
                $div.appendChild($button);

                const actions: Action[] = [
                    {
                        classNames: ["and"],
                        run: () => onUpdate({type: "__and", items: []}),
                    },
                    {
                        classNames: ["or"],
                        run: () => onUpdate({type: "__or", items: []}),
                    },
                    {
                        classNames: ["not"],
                        run: () => onUpdate({type: "__not", items: []}),
                    },
                    {
                        classNames: ["new"],
                        run: () => onUpdate({type: "__new"}),
                    }
                ];
                if (owner !== undefined) {
                    actions.push({
                        classNames: ["use"],
                        run: () => onUpdate({type: "__use"}),
                    });
                }
                Action.appendHTMLMenu($div, $div, ...actions);
                this.$root.appendChild($div);
            }
        };
        onUpdate(expr);
    }

    public tokenize(): xnet.Expression {
        return this.root !== undefined
            ? this.root.tokenize()
            : null;
    }

    protected _render(): HTMLElement {
        return this.$root;
    }
}