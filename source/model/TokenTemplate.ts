import {isTokenTemplateField, TokenTemplateField} from "./TokenTemplateField";
import {xnet} from "./xnet";

/**
 * A template describing one kind of token that may be created.
 */
export interface TokenTemplate {
    /**
     * A prefix to prepend to the IDs of qualified tokens of `type`.
     */
    idPrefix?: string;

    /**
     * Whether or not tokens of the described type may be qualified by the
     * current user.
     */
    isQualifiable: boolean;

    /**
     * The type of `Token` regulated by this template.
     */
    type: string;

    /**
     * The data fields of the described kind of token.
     */
    data: { [name: string]: TokenTemplateField };
}

/**
 * Determines if given value is a `TokenTemplate`.
 *
 * @param any Checked value.
 * @return Whether `any` is of type `TokenTemplate`.
 */
export function isTokenTemplate(any: any): any is TokenTemplate {
    return typeof any === "object" && any !== null
        && (any.idPrefix === undefined || typeof any.idPrefix === "string")
        && typeof any.isQualifiable === "boolean"
        && typeof any.type === "string"
        && typeof any.data === "object" && any.data !== null
        && Object.getOwnPropertyNames(any.data)
            .findIndex(name => !isTokenTemplateField(any.data[name])) === -1;
}

/**
 * Creates a new `Token` from given `template` with default values.
 *
 * @param template Template to use.
 * @return Created `Token`.
 */
export function createTokenFromTemplate(template: TokenTemplate): xnet.Token {
    return {
        type: template.type,
        data: createDefaultDataObjectFromTokenTemplate(template),
    };

    function createDefaultDataObjectFromTokenTemplate(template: TokenTemplate): any {
        const result: any = {};
        for (const name of Object.getOwnPropertyNames(template.data)) {
            const field = template.data[name];
            result[name] = field.default;
        }
        return result;
    }
}
