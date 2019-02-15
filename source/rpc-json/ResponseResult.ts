import {Response} from "./Response";

/**
 * A JSON-RPC 2.0 response result.
 */
export interface ResponseResult extends Response {
    /**
     * Concrete result returned in response to some request.
     */
    result: any,

    /**
     * Identifies request responded to.
     */
    id: number | string,
}

/**
 * Determines if given `response` is of type `ResponseResult`.
 *
 * @param response Response to check.
 * @returns Whether or not `response` is of type `ResponseResult`.
 */
export function isResponseResult(response: Response): response is ResponseResult {
    return (<ResponseResult>response).result !== undefined
        && response.id !== null;
}