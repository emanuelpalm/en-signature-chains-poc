import {Action} from "./Action";
import {Any, xnet} from "../../../model";
import {NodeLogic} from "./NodeLogic";
import {Context} from "./Context";

export abstract class NodeAndOr<T extends (xnet.And | xnet.Or)> extends NodeLogic<T> {
    protected constructor(
        protected readonly context: Context,
        protected readonly onUpdate: (expr: xnet.Expression) => void,
        protected readonly expr: T,
        className: string,
    )
    {
        super("expr", className,
            (expr.items || []).length > 0
                ? "has-items"
                : "no-items");
    }

    protected actionsAddChild(): Action[] {
        const addExpr = (childExpr: xnet.Expression) => {
            const clone = Any.clone(this.expr);
            clone.items.push(childExpr);
            this.onUpdate(clone);
        };
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
                    items: this.expr.items.slice(),
                }),
            },
            {
                classNames: ["or"],
                run: () => this.onUpdate({
                    type: "__or",
                    items: this.expr.items.slice(),
                }),
            },
            {
                classNames: ["not"],
                run: () => this.onUpdate({
                    type: "__not",
                    item: this.expr.items[0] || null,
                }),
            },
            {
                classNames: ["fold"],
                run: () => this.onUpdate(this.expr.items[0] || null),
            },
            {
                classNames: ["remove"],
                run: () => this.onUpdate(null),
            },
        ];
    }
}