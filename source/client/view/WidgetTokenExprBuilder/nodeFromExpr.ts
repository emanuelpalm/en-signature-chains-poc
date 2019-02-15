import {Context} from "./Context";
import {Node} from "./Node";
import {NodeToken} from "./NodeToken";
import {NodeAnd} from "./NodeAnd";
import {NodeNot} from "./NodeNot";
import {NodeOr} from "./NodeOr";
import {NodeTokenNew} from "./NodeTokenNew";
import {NodeTokenUse} from "./NodeTokenUse";
import {xnet} from "../../../model";

export function nodeFromExpr(
    context: Context,
    onUpdate: (expr: xnet.Expression) => void,
    expr: xnet.Expression
): Node<xnet.Expression> | undefined
{
    if (expr === null) {
        return undefined;
    }
    if (expr.type === "__new") {
        return new NodeTokenNew(context, onUpdate);
    }
    if (expr.type === "__use") {
        if (context.owner === undefined) {
            throw new Error("Use expr not permitted for other users than \"me\".");
        }
        return new NodeTokenUse(context as Required<Context>, onUpdate);
    }
    if (xnet.isExpressionToken(expr)) {
        return new NodeToken(context, onUpdate, expr);
    }
    if (xnet.isExpressionAnd(expr)) {
        return new NodeAnd(context, onUpdate, expr);
    }
    else if (xnet.isExpressionOr(expr)) {
        return new NodeOr(context, onUpdate, expr);
    }
    else if (xnet.isExpressionNot(expr)) {
        return new NodeNot(context, onUpdate, expr);
    }
    else {
        throw new Error("Invalid token expression: " + JSON.stringify(expr));
    }
}