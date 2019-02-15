import {isUser, User} from "./User";
import {xnet} from "./xnet";

/**
 * A `Proposal`, as understood by the application client.
 *
 * Is meant to be shared only between a node and its client, not between nodes.
 */
export interface Proposal {
    /**
     * Internal identifier.
     */
    id?: number,

    /**
     * The user creating this proposal.
     */
    proposer?: User,

    /**
     * The user receiving this proposal.
     */
    receiver?: User;

    /**
     * A description of what tokens are desired, if any.
     */
    wants: xnet.Expression,

    /**
     * A description of what tokens are offered in return for the desired such,
     * if any.
     */
    gives: xnet.Expression,

    /**
     * Identifies a contract or other type definition.
     */
    definition?: xnet.Hash,

    /**
     * The hash of the last `Exchange`, if relevant, finalized by the same
     * users as are sending and receiving this `Proposal`. The `Exchange`
     * should contain a `Proposal` referring to the same `contract` as this
     * one.
     */
    predecessor?: xnet.Hash,

    /**
     * The proposing user's signature of this proposal.
     */
    signature?: xnet.Signature,

    /**
     * The status of the proposal, determined by user actions, etc.
     */
    status?: ProposalStatus,
}

export enum ProposalStatus {
    Accepted = "accepted",
    Discarded = "discarded",
    Failed = "failed",
    Handled = "handled",
    Sent = "sent",
}

/**
 * Determines if given value is a `Proposal`.
 *
 * @param any Checked value.
 * @return Whether `any` is of type `Proposal`.
 */
export function isProposal(any: any): any is Proposal {
    return typeof any === "object" && any !== null
        && (any.proposer === undefined || isUser(any.proposer))
        && (any.receiver === undefined || isUser(any.receiver))
        && xnet.isExpression(any.wants)
        && xnet.isExpression(any.gives)
        && (any.definition === undefined || xnet.isHash(any.definition))
        && (any.predecessor === undefined || xnet.isHash(any.predecessor))
        && (any.signature === undefined || xnet.isSignature(any.signature));
}
