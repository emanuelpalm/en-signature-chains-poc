import {Error as _Error} from "./Error";
import {Method} from "./Method";
import {RouterObserver} from "./RouterObserver";
import {Socket} from "./Socket";
import {SocketObserver} from "./SocketObserver";
import {SocketSource} from "./SocketSource";
import {SocketSourceObserver} from "./SocketSourceObserver";
import {Observable} from "../util";

/**
 * Routes RPC calls and notifications to registered methods.
 */
export class Router extends Observable<RouterObserver> {
    private readonly sources: Map<SocketSource, SocketSourceObserver> = new Map();
    private readonly sockets: Map<Socket, SocketObserver> = new Map();
    private readonly routes: Map<string, Method> = new Map();

    /**
     * Adds RPC call method to router.
     *
     * @param name Name of added method.
     * @param method Method implementation.
     */
    public method(name: string, method: Method) {
        if (this.routes.has(name)) {
            throw new Error(`Method with name ${name} already exists`)
        }
        this.routes.set(name, method);
    }

    /**
     * Sends notification to all active sockets.
     *
     * @param name Name of called method.
     * @param args Method arguments, if any.
     */
    public notifyAll(name: string, ...args: any[]) {
        for (const socket of this.sockets.keys()) {
            socket.notify(name, ...args);
        }
    }

    /**
     * Adds socket to router, causing messages it receives to be routed.
     *
     * Sockets are removed automatically when they are closed.
     *
     * @param socket Socket to add.
     */
    public socket(socket: Socket) {
        if (this.sockets.has(socket)) {
            return;
        }
        socket.setCallback(async (name, ...args) => {
            try {
                const method = this.routes.get(name);
                if (method === undefined) {
                    return _Error.METHOD_NOT_FOUND;
                }
                const result = method(...args);
                return isPromise(result) ? await result : result;
            }
            catch (error) {
                this.forEachSubscriber(s => s.onMethodError(name, error));
                return _Error.INTERNAL_ERROR;
            }
        });
        const observer: SocketObserver = {
            onClose: (error) => {
                this.forEachSubscriber(s => s.onSocketClose(socket, error));
                this.sockets.delete(socket);
            },
            onError: (error) => {
                this.forEachSubscriber(s => s.onSocketError(socket, error));
            },
            onOpen: () => {
                this.forEachSubscriber(s => s.onSocketOpen(socket));
            },
        };
        socket.subscribe(observer);
        this.sockets.set(socket, observer);

        function isPromise(any: any): any is Promise<any> {
            return typeof any === "object"
                && any !== null
                && typeof (<Promise<any>>any).then === "function";
        }
    }

    /**
     * Adds source to router, causing any sockets it spawns to be added.
     *
     * @param source Source to add.
     */
    public source(source: SocketSource) {
        if (this.sources.has(source)) {
            throw new Error(`Source already registered`);
        }
        const observer: SocketSourceObserver = {
            onClose: error => this.forEachSubscriber(s => s.onSourceClose(source, error)),
            onError: error => this.forEachSubscriber(s => s.onSourceError(source, error)),
            onSocket: socket => this.socket(socket),
        };
        source.subscribe(observer);
        this.sources.set(source, observer);
    }

    /**
     * Attempts to remove named method.
     *
     * @param method Name of removed method.
     * @returns Whether or not given `method` was removed.
     */
    public removeMethod(method: string): boolean {
        return this.routes.delete(method);
    }

    /**
     * Attempts to remove a previously added source from router.
     *
     * A successful call to this method will prevent sockets spawned by
     * `source` from being added to router. Any previously spawned sockets that
     * are still open will, however, not be removed. Such will be removed from
     * the router when they close, as is always the case for sockets added to a
     * router.
     *
     * @param source Source to remove from router.
     * @returns Whether or not given `source` was removed.
     */
    public removeSource(source: SocketSource): boolean {
        const observer = this.sources.get(source);
        if (observer === undefined) {
            return false;
        }
        this.sources.delete(source);
        source.unsubscribe(observer);
        return true;
    }
}