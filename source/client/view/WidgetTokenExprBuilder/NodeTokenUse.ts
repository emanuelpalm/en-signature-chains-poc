import {Context} from "./Context";
import {Node} from "./Node";
import {Widget} from "../Widget";
import {WidgetSelect} from "../WidgetSelect";
import {xnet} from "../../../model";

export class NodeTokenUse extends Widget implements Node<xnet.Token | null> {
    private readonly select: WidgetSelect<xnet.Token>;

    public constructor(
        private readonly context: Required<Context>,
        private readonly onUpdate: (expr: xnet.Expression) => void,
    )
    {
        super("token");
        this.select = new WidgetSelect(
            (token: xnet.Token) => `${token.type} (${token.id})`,
            context.model.tokens().getAllOwnedBy(context.owner),
        );
    }

    protected _render(): HTMLElement {
        const $root = document.createElement("div");
        $root.classList.add("node", "token", "new");

        $root.appendChild(this.select.render());
        setTimeout(() => this.select.open());
        this.select.subscribe((token: xnet.Token | undefined) => {
            this.onUpdate(token !== undefined ? token : null);
        });

        return $root;
    }

    public tokenize(): xnet.Token | null {
        const token = this.select.value();
        return token !== undefined ? token : null;
    }
}
