import {Context} from "./Context";
import {Node} from "./Node";
import {nodeFromExpr} from "./nodeFromExpr";
import {NodeAndOr} from "./NodeAndOr";
import {Widget} from "../Widget";
import {xnet} from "../../../model";

export class NodeOr extends NodeAndOr<xnet.Or> {
    private readonly _items: Node[];

    public constructor(
        context: Context,
        onUpdate: (expr: xnet.Expression) => void,
        expr: xnet.Or,
    )
    {
        super(context, onUpdate, expr, "or");
        this._items = expr.items
            .map((childExpr, index) => nodeFromExpr(context, childExpr => {
                const items = expr.items.slice();
                if (childExpr !== null) {
                    items.splice(index, 1, childExpr);
                }
                else {
                    items.splice(index, 1);
                }
                onUpdate({type: "__or", items});
            }, childExpr))
            .filter(childExpr => childExpr !== undefined) as Node[];
    }

    public tokenize(): xnet.Or {
        return {
            type: "__or",
            items: this._items.map(item => item.tokenize()),
        };
    }

    public items(): Widget[] {
        return this._items;
    }
}