import {Context} from "./Context";
import {createTokenFromTemplate, TokenTemplate, xnet} from "../../../model";
import {Node} from "./Node";
import {Widget} from "../Widget";
import {WidgetSelect} from "../WidgetSelect";

export class NodeTokenNew extends Widget implements Node<xnet.Token | null> {
    private readonly select: WidgetSelect<TokenTemplate>;

    public constructor(
        private readonly context: Context,
        private readonly onUpdate: (expr: xnet.Expression) => void,
    )
    {
        super("token");
        this.select = new WidgetSelect(
            (option: TokenTemplate) => option.type,
            context.model.tokenTemplates().slice(),
        );
    }

    protected _render(): HTMLElement {
        const $root = document.createElement("div");
        $root.classList.add("node", "token", "new");

        $root.appendChild(this.select.render());
        setTimeout(() => this.select.open());
        this.select.subscribe((tokenTemplate: TokenTemplate | undefined) => {
            this.onUpdate(tokenizeTokenTemplate(tokenTemplate));
        });

        return $root;
    }

    public tokenize(): xnet.Token | null {
        return tokenizeTokenTemplate(this.select.value());
    }
}

function tokenizeTokenTemplate(tokenTemplate: TokenTemplate | undefined): xnet.Token | null {
    return tokenTemplate !== undefined
        ? createTokenFromTemplate(tokenTemplate)
        : null;
}