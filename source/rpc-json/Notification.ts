import {Call} from "./Call";

/**
 * A JSON-RPC 2.0 notification object.
 */
export interface Notification extends Call {
    /**
     * Call arguments.
     */
    params?: any[],

    /**
     * Call identifier, which must be either absent or null.
     */
    id?: null,
}

/**
 * Determines if given `call` is of type `Notification`.
 *
 * @param call Call to check.
 * @returns Whether or not `message` is of type `Notification`.
 */
export function isNotification(call: Call): call is Notification {
    const id = (<Notification>call).id;
    return id === undefined || id === null;
}