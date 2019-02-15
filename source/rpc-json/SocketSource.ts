import {SocketSourceObserver} from "./SocketSourceObserver";
import {Observable} from "../util";

/**
 * Some object publishing RPC sockets.
 */
export abstract class SocketSource
    extends Observable<SocketSourceObserver>
{
}