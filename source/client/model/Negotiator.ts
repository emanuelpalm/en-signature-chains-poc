import * as rpc from "../../rpc-json";
import {Proposal} from "../../model";

export class Negotiator {
    public constructor(private readonly socket: rpc.Socket) {}

    /**
     * Notifies node server about `proposal` being accepted by client.
     *
     * @param proposal Accepted proposal.
     */
    public accept(proposal: Proposal): Promise<void> {
        return this.socket.notify("negotiator.accept", proposal);
    }

    /**
     * Notifies node server about `proposal` being ignored by client.
     *
     * @param proposal Ignored proposal.
     */
    public discard(proposal: Proposal): Promise<void> {
        return this.socket.notify("negotiator.discard", proposal);
    }

    /**
     * Notifies node server about `proposal` to be sent.
     *
     * @param proposal New proposal.
     */
    public propose(proposal: Proposal): Promise<void> {
        return this.socket.notify("negotiator.propose", proposal);
    }
}