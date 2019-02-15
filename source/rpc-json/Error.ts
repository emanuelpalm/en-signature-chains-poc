import {ErrorCode} from "./ErrorCode";

/**
 * Describes some error preventing a request from being fulfilled.
 */
export interface Error {
    /**
     * Indicates type of error.
     */
    code: ErrorCode,

    /**
     * Human-readable description of error.
     */
    message: string,

    /**
     * Any error data of relevance.
     */
    data?: any,
}

export namespace Error {
    export const NOT_CONNECTED = {
        code: ErrorCode.NOT_CONNECTED,
        message: "Not connected",
    };

    export const TIMEOUT = {
        code: ErrorCode.TIMEOUT,
        message: "Timeout",
    };

    export const UNEXPECTED_RESPONSE = {
        code: ErrorCode.UNEXPECTED_RESPONSE,
        message: "Unexpected response",
    };

    export const PARSE_ERROR = {
        code: ErrorCode.PARSE_ERROR,
        message: "Parse error",
    };

    export const INVALID_REQUEST = {
        code: ErrorCode.INVALID_REQUEST,
        message: "Invalid request",
    };

    export const METHOD_NOT_FOUND = {
        code: ErrorCode.METHOD_NOT_FOUND,
        message: "Method not found",
    };

    export const INVALID_PARAMS = {
        code: ErrorCode.INVALID_PARAMS,
        message: "Invalid arguments",
    };

    export const INTERNAL_ERROR = {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Internal error",
    };
}

/**
 * Determines if given value is of type `Error`.
 *
 * @param any Value to check.
 * @returns Whether or not `any` is of type `Error`.
 */
export function isError(any: any): any is Error {
    return typeof any === "object"
        && typeof (<Error>any).code === "number"
        && typeof (<Error>any).message === "string";
}