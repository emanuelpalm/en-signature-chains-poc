import {Widget} from "./Widget";
import {Any, xnet} from "../../model";

export class WidgetToken extends Widget {
    public constructor(private readonly token: xnet.Token) {
        super();
    }

    public tokenize(): xnet.Token {
        return Any.clone(this.token);
    }

    protected _render(): HTMLElement {
        const $root = document.createElement("div");
        $root.classList.add("en-token");

        $root.textContent = "";
        if (xnet.isTokenQualified(this.token)) {
            $root.classList.add("qualified");
        }
        appendValue("kind", this.token.type);
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
                appendPair(key, value.toString());
            }
            break;

        default:
            break;
        }

        return $root;

        function appendPair(label: string, value: string) {
            const $label = document.createElement("div");
            $label.classList.add("label");
            $label.textContent = label;
            $root.appendChild($label);

            const $value = document.createElement("div");
            $value.classList.add("value");
            $value.textContent = value;
            $root.appendChild($value);
        }

        function appendValue(className: string, value: string) {
            const $div = document.createElement("div");
            $div.classList.add(className);
            $div.textContent = value;
            $root.appendChild($div);
        }
    }
}