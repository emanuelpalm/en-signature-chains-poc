/**
 * A JSON-RPC 2.0 message object.
 */
export interface Message {
    /**
     * Version identifier.
     */
    jsonrpc: "2.0",
}

/**
 * Determines if given `object` is of type `Message`.
 *
 * @param object Object to check.
 * @returns Whether or not `message` is of type `Message`.
 */
export function isMessage(object: object): object is Message {
    return (<Message>object).jsonrpc === "2.0";
}
