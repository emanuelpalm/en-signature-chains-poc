import {Data} from "./Data";
import {ListAsyncRPC} from "../util";
import {ListCached} from "../../util";
import * as rpc from "../../rpc-json";
import {xnet} from "../../model";

/**
 * Represents the collection of all currently known exchanges.
 */
export class DataExchanges
    extends ListCached<xnet.Exchange>
    implements Data<xnet.Exchange>
{
    private static readonly NAME = "exchanges";
    public readonly name: "exchanges";

    /**
     * Creates new model for exchanges.
     */
    public constructor(socket: rpc.Socket) {
        super(new ListAsyncRPC(socket, DataExchanges.NAME, xnet.isExchange));
        this.name = DataExchanges.NAME;
    }
}