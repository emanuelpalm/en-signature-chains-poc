import {isError, Error as _Error} from "./Error";
import {Response} from "./Response";

/**
 * A JSON-RPC 2.0 response error.
 */
export interface ResponseError extends Response {
    /**
     * Description of error.
     */
    error: _Error,
}

/**
 * Determines if given `response` is of type `ResponseError`.
 *
 * @param response Response to check.
 * @returns Whether or not `response` is of type `ResponseError`.
 */
export function isResponseError(response: Response): response is ResponseError {
    return isError((<ResponseError>response).error);
}