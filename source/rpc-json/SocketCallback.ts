/**
 * A function useful for handling method invocations.
 *
 * The value returned by the function is to be sent to the method invoker.
 */
export type SocketCallback = (method: string, ...args: any[]) => Promise<any>
