import {Context} from "./Context";
import {Node} from "./Node";
import {nodeFromExpr} from "./nodeFromExpr";
import {NodeAndOr} from "./NodeAndOr";
import {Widget} from "../Widget";
import {xnet} from "../../../model";

export class NodeAnd extends NodeAndOr<xnet.And> {
    private readonly _items: Node[];

    public constructor(
        context: Context,
        onUpdate: (expr: xnet.Expression) => void,
        expr: xnet.And,
    )
    {
        super(context, onUpdate, expr, "and");
        this._items = expr.items
            .map((childExpr, index) => nodeFromExpr(context, childExpr => {
                const items = expr.items.slice();
                if (childExpr !== null) {
                    items.splice(index, 1, childExpr);
                }
                else {
                    items.splice(index, 1);
                }
                onUpdate({type: "__and", items});
            }, childExpr))
            .filter(childExpr => childExpr !== undefined) as Node[];
    }

    public tokenize(): xnet.And {
        return {
            type: "__and",
            items: this._items.map(item => item.tokenize()),
        };
    }

    public items(): Widget[] {
        return this._items;
    }
}