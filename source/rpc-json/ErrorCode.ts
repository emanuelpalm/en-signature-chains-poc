/**
 * Enumerates standardized JSON-RPC 2.0 error codes.
 */
export const enum ErrorCode {
    /**
     * No current connection exists to remote host.
     */
    NOT_CONNECTED = -32000,

    /**
     * A request was not responded to within some deadline.
     */
    TIMEOUT = -32001,

    /**
     * A received response was not expected.
     */
    UNEXPECTED_RESPONSE = -32002,

    /**
     * Invalid JSON was received by the client. An error occurred on the client
     * while parsing the JSON text.
     */
    PARSE_ERROR = -32700,

    /**
     * The JSON sent is not a valid Request object.
     */
    INVALID_REQUEST = -32600,

    /**
     * The method does not exist / is not available.
     */
    METHOD_NOT_FOUND = -32601,

    /**
     * Invalid method parameter(s).
     */
    INVALID_PARAMS = -32602,

    /**
     * Internal JSON-RPC error.
     */
    INTERNAL_ERROR = -32603,
}