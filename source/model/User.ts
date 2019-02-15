import {xnet} from "./xnet";

/**
 * Represents a user that can own and exchange `Token`s.
 */
export interface User {
    /**
     * Public key identifying a user.
     */
    key: xnet.ID;

    /**
     * Public key algorithm used to generate `key`.
     */
    keyAlgorithm: string;

    /**
     * Common name of `User`.
     */
    name: string;

    /**
     * Any other `User` attributes.
     */
    attributes?: { [attribute: string]: string };
}

/**
 * Determines if given value is a `User`.
 *
 * @param any Checked value.
 * @return Whether `any` is of type `User`.
 */
export function isUser(any: any): any is User {
    return typeof any === "object" && any !== null
        && xnet.isID(any.key)
        && typeof any.keyAlgorithm === "string"
        && typeof any.name === "string"
        && (any.attributes === undefined || (
            typeof any.attributes === "object" && any.attributes !== null && Object
                .getOwnPropertyNames(any.attributes)
                .findIndex(attribute => {
                    return typeof attribute !== "string"
                        || typeof any.attributes[attribute] !== "string"
                }) === -1
        ));
}