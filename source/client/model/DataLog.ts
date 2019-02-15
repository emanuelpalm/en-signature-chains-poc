import {Data} from "./Data";
import {isLogEntry, LogEntry} from "../../model";
import {ListCached} from "../../util";
import {ListAsyncRPC} from "../util";
import * as rpc from "../../rpc-json";

/**
 * Represents the collection of all currently known log entries.
 */
export class DataLog
    extends ListCached<LogEntry>
    implements Data<LogEntry>
{
    private static readonly NAME = "log";
    public readonly name: "log";

    /**
     * Creates new model for log.
     */
    public constructor(socket: rpc.Socket) {
        super(new ListAsyncRPC(socket, DataLog.NAME, isLogEntry));
        this.name = DataLog.NAME;
    }
}