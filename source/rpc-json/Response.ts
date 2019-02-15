import {Call} from "./Call";
import {Message} from "./Message";

/**
 * A JSON-RPC 2.0 response object, of unknown concrete response type.
 */
export interface Response extends Message {
    /**
     * Identifies request responded to.
     */
    id: null | number | string,
}

/**
 * Determines if given `message` is of type `Response`.
 *
 * @param message Message to check.
 * @returns Whether or not `message` is of type `Response`.
 */
export function isResponse(message: Message): message is Response {
    const method = (<Call>message).method;
    const id = (<Response>message).id;
    const idType = typeof id;
    return method === undefined
        && (idType === "number" || (idType === "string" && (<string>id).length > 0));
}