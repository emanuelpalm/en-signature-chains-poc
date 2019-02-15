import {ListAsyncRPC} from "../util";
import {Data} from "./Data";
import {isProposal, Proposal} from "../../model";
import {ListCached} from "../../util";
import * as rpc from "../../rpc-json";

/**
 * Represents the collection of all currently known proposals.
 */
export class DataProposals
    extends ListCached<Proposal>
    implements Data<Proposal>
{
    private static readonly NAME = "proposals";

    public readonly name: "proposals";

    /**
     * Creates new model for proposals.
     */
    public constructor(socket: rpc.Socket) {
        super(new ListAsyncRPC(socket, DataProposals.NAME, isProposal));
        this.name = DataProposals.NAME;
    }
}