import {Message} from "./Message";

/**
 * A JSON-RPC 2.0 call object, of unknown concrete call type.
 */
export interface Call extends Message {
    /**
     * Name of invoked method.
     */
    method: string,
}

/**
 * Determines if given `message` is of type `Call`.
 *
 * @param message Message to check.
 * @returns Whether or not `message` is of type `Call`.
 */
export function isCall(message: Message): message is Call {
    const method = (<Call>message).method;
    return typeof method === "string"
        && method.length > 0;
}