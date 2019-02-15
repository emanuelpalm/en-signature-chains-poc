/**
 * A function useful for handling invocations of one particular method.
 *
 * The function may be asynchronous or synchronous. If a method caller expects
 * no response, whatever response is returned is discarded. On the other hand,
 * if the caller does expect a response, `null` is provided if nothing is
 * returned.
 *
 * If a JSON-RPC 2.0 `Error` object is returned, that is provided in a error
 * result object to the method caller.
 */
export type Method = (...args: any[]) => (Promise<any> | any);