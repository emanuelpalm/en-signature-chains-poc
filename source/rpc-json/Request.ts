import {Call} from "./Call";

/**
 * A JSON-RPC 2.0 request object.
 */
export interface Request extends Call {
    /**
     * Call arguments.
     */
    params?: any[],

    /**
     * Call response identifier.
     */
    id: number | string,
}

/**
 * Determines if given `call` is of type `Request`.
 *
 * @param call Call to check.
 * @returns Whether or not `message` is of type `Request`.
 */
export function isRequest(call: Call): call is Request {
    const id = (<Request>call).id;
    const idType = typeof id;
    return idType === "number" || (idType === "string" && (<string>id).length > 0);
}