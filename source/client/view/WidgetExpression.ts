import {Widget} from "./Widget";
import {WidgetToken} from "./WidgetToken";
import {xnet} from "../../model";

export class WidgetExpression extends Widget {
    public constructor(
        private readonly tokenExpr: xnet.Expression
    )
    {
        super();
    }

    protected _render(): HTMLElement {
        return renderExpr(this.tokenExpr);

        function renderExpr(expr: xnet.Expression) {
            if (xnet.isExpressionToken(expr)) {
                return new WidgetToken(expr).render();
            }
            const $div = document.createElement("div");
            $div.classList.add("en-token-expr");
            if (expr === null) {
                $div.classList.add("nothing");
            }
            else if (xnet.isExpressionAnd(expr)) {
                $div.classList.add("and");
                for (const item of expr.items) {
                    $div.appendChild(renderExpr(item));
                }
            }
            else if (xnet.isExpressionOr(expr)) {
                $div.classList.add("or");
                for (const item of expr.items) {
                    $div.appendChild(renderExpr(item));
                }
            }
            else if (xnet.isExpressionNot(expr)) {
                $div.classList.add("not");
                $div.appendChild(renderExpr(expr.item));
            }
            else {
                $div.classList.add("invalid");
            }
            return $div;
        }
    }
}