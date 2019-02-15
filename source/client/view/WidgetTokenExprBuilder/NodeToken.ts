import {Action} from "./Action";
import {Any, User, xnet} from "../../../model";
import {Context} from "./Context";
import {Node} from "./Node";
import {Widget} from "../Widget";

export class NodeToken extends Widget implements Node<xnet.Token> {
    private readonly isQualified: boolean;
    private readonly isQualifiable: boolean;
    private readonly data: [HTMLElement, HTMLElement][] = [];

    public constructor(
        private readonly context: Context,
        private readonly onUpdate: (expr: xnet.Expression) => void,
        private readonly token: xnet.Token,
    )
    {
        super("token");
        this.isQualified = xnet.isTokenQualified(token);
        this.isQualifiable = context.owner !== undefined && !this.isQualified && (
            context.model.tokens().isQualifiable(context.owner, token) ||
            context.model.tokenTemplates().isQualifiable(token)
        );
    }

    public tokenize(): xnet.Token {
        const token: xnet.Token = {
            type: this.token.type,
        };
        if (this.token.id !== undefined) {
            token.id = this.token.id;
        }
        token.data = {};
        for (const [$label, $value] of this.data) {
            const label = ($label.textContent || "").trim();
            token.data[label] = ($value instanceof HTMLSelectElement
                ? $value.value
                : $value.textContent || "").trim();
        }
        return token;
    }

    public _render(): HTMLElement {
        const $root = document.createElement("div");
        $root.classList.add("node", "token");
        if (!this.isQualifiable && !this.isQualified) {
            $root.classList.add("unqualifiable");
        }

        // Render token.
        let $token: HTMLElement;
        let $kind: HTMLElement;
        {
            $token = document.createElement("div");
            $token.classList.add("en-token");

            const tokenTemplate = this.context.model.tokenTemplates()
                .findByKind(this.token.type)[0];
            let createValueElement: (label: string, value: string) => HTMLElement;
            if (this.isQualified) {
                createValueElement = (label: string, value?: string) => {
                    const $value = document.createElement("div");
                    $value.classList.add("value");
                    $value.textContent = value || "";
                    $token.appendChild($value);
                    return $value;
                };
            }
            else if (tokenTemplate !== undefined) {
                createValueElement = (label: string, value?: string) => {
                    const options: string[] = [];
                    const field = tokenTemplate.data[label];
                    if (field !== undefined) {
                        if (field.options !== undefined) {
                            options.push(...field.options);
                        }
                        if (field.referenceToType !== undefined) {
                            const references = this.context.model.tokens()
                                .findByKind(field.referenceToType, 100)
                                .map(token => token.id)
                                .filter(id => id !== undefined) as string[];
                            if (references.length === 0) {
                                references.push("");
                            }
                            options.push(...references);
                        }
                        if (value === undefined && field.default !== undefined) {
                            value = field.default;
                        }
                    }
                    let $value;
                    if (options.length > 1) {
                        $value = document.createElement("select");
                        for (const option of options) {
                            const $option = document.createElement("option");
                            $option.text = option;
                            $option.value = option;
                            if (option === value) {
                                $option.selected = true;
                            }
                            $value.appendChild($option);
                        }
                    }
                    else if (options.length === 1 && value !== undefined) {
                        $value = document.createElement("div");
                        $value.textContent = value;
                    }
                    else {
                        $value = document.createElement("input");
                        $value.setAttribute("type", "text");
                        if (value !== undefined) {
                            $value.value = value;
                        }
                    }
                    $value.classList.add("value");
                    return $value;
                };
            }
            else {
                createValueElement = (label: string, value: string) => {
                    const $value = document.createElement("input");
                    $value.setAttribute("type", "text");
                    $value.classList.add("value");
                    $value.value = value;
                    return $value;
                };
            }

            const appendPair = (label: string, value: string) => {
                const $label = document.createElement("div");
                $label.classList.add("label");
                $label.textContent = label;
                $token.appendChild($label);

                const $value = createValueElement(label, value);
                $value.addEventListener("change", () => this.onUpdate(this.tokenize()));
                $token.appendChild($value);

                data.push([$label, $value]);
            };

            const appendValue = (className: string, value: string): HTMLElement => {
                const $div = document.createElement("div");
                $div.classList.add(className);
                $div.textContent = value;
                $token.appendChild($div);
                return $div;
            };

            if (this.isQualified) {
                $token.classList.add("qualified");
            }
            const data = this.data;
            $kind = appendValue("kind", this.token.type);
            if (this.token.id !== undefined) {
                appendValue("en-id", this.token.id);
            }
            switch (typeof this.token.data) {
            case "boolean":
            case "number":
            case "string":
                appendPair("data", this.token.data.toString());
                break;

            case "object":
                if (this.token.data === null) {
                    break;
                }
                for (const key of Object.getOwnPropertyNames(this.token.data)) {
                    const value = this.token.data[key];
                    appendPair(key, (value || "").toString());
                }
                break;

            default:
                break;
            }

            $root.appendChild($token);
        }

        // Render node modification menu.
        {
            const actions = [];
            if (this.isQualifiable) {
                actions.push({
                    name: "Qualify",
                    run: () => {
                        let token = this.tokenize();
                        let expr;
                        try {
                            expr = this.context.model.tokenTemplates()
                                .qualify(token);
                        }
                        catch (error) {
                            expr = this.context.model.tokens()
                                .qualify(this.context.owner as User, token);
                        }
                        this.onUpdate(expr);
                    },
                });
            }
            else if (this.isQualified) {
                actions.push({
                    name: "Unqualify",
                    run: () => {
                        const token = Any.clone(this.token);
                        delete (token.id);
                        this.onUpdate(token);
                    }
                });
            }
            actions.push(
                {
                    name: "Remove",
                    run: () => this.onUpdate(null),
                },
            );

            Action.appendHTMLMenu($root, $kind, ...actions);
        }

        return $root;
    }
}