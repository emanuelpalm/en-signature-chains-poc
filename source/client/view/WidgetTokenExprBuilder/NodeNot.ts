import {Action} from "./Action";
import {Context} from "./Context";
import {Node} from "./Node";
import {NodeLogic} from "./NodeLogic";
import {nodeFromExpr} from "./nodeFromExpr";
import {Widget} from "../Widget";
import {xnet} from "../../../model";

export class NodeNot extends NodeLogic<xnet.Not> {
    private readonly item: Node | undefined;

    public constructor(
        private readonly context: Context,
        private readonly onUpdate: (expr: xnet.Expression) => void,
        private readonly expr: xnet.Not,
    )
    {
        super("expr", "not");
        if (expr.item !== undefined && expr.item !== null) {
            this.item = nodeFromExpr(context, childExpr => onUpdate({
                type: "__not",
                item: childExpr,
            }), expr.item);
        }
    }

    public tokenize(): xnet.Not {
        return {
            type: "__not",
            item: this.item !== undefined
                ? this.item.tokenize()
                : null,
        };
    }

    protected actionsAddChild(): Action[] {
        if (this.item === undefined) {
            return [];
        }
        const addExpr = (childExpr: xnet.Expression) => this.onUpdate({
            type: "__not",
            item: childExpr,
        });
        const actions: Action[] = [
            {
                classNames: ["and"],
                run: () => addExpr({type: "__and", items: []}),
            },
            {
                classNames: ["or"],
                run: () => addExpr({type: "__or", items: []}),
            },
            {
                classNames: ["not"],
                run: () => addExpr({type: "__not", items: []}),
            },
            {
                classNames: ["new"],
                run: () => addExpr({type: "__new"}),
            }
        ];
        if (this.context.owner !== undefined) {
            actions.push({
                classNames: ["use"],
                run: () => addExpr({type: "__use"}),
            });
        }
        return actions;
    }

    protected actionsModify(): Action[] {
        return [
            {
                classNames: ["and"],
                run: () => this.onUpdate({
                    type: "__and",
                    items: this.expr.item !== null ? [this.expr.item] : [],
                }),
            },
            {
                classNames: ["or"],
                run: () => this.onUpdate({
                    type: "__or",
                    items: this.expr.item !== null ? [this.expr.item] : []
                }),
            },
            {
                classNames: ["not"],
                run: () => this.onUpdate({
                    type: "__not",
                    item: this.expr.item || null,
                }),
            },
            {
                classNames: ["fold"],
                run: () => this.onUpdate(this.expr.item || null),
            },
            {
                classNames: ["remove"],
                run: () => this.onUpdate(null),
            },
        ];
    }

    public items(): Widget[] {
        return this.item !== undefined
            ? [this.item]
            : [];
    }
}