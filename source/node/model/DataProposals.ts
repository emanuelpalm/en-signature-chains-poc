import {Data} from "./Data";
import {ListArray} from "../../util";
import {Proposal, ProposalStatus, User} from "../../model";

export class DataProposals
    extends ListArray<Proposal>
    implements Data<Proposal>
{
    public name: "proposals";

    private nextId = 0;

    public constructor() {
        super();
        this.name = "proposals";
    }

    public updateProposal(proposal: Proposal, status?: ProposalStatus) {
        if (status !== undefined) {
            proposal.status = status;
        }
        if (status === undefined || status === ProposalStatus.Sent) {
            let index = 0;
            for (const item of this.items()) {
                if (item.status === undefined && item.id !== proposal.id
                    && this.areProposerAndAcceptorMatching(item, proposal))
                {
                    item.status = ProposalStatus.Discarded;
                    this.splice(index, 1, item);
                }
                index += 1;
            }
        }
        if (proposal.id !== undefined) {
            let index = 0;
            for (const item of this.items()) {
                if (item.id === proposal.id) {
                    this.splice(index, 1, proposal);
                    return;
                }
                index += 1;
            }
        }
        else {
            proposal.id = this.generateProposalId();
        }
        this.splice(0, 0, proposal);
    }

    private generateProposalId(): number {
        const id = this.nextId;
        if (this.nextId >= Number.MAX_SAFE_INTEGER) {
            this.nextId = Number.MIN_SAFE_INTEGER;
        }
        else {
            this.nextId += 1;
        }
        return id;
    }

    private areProposerAndAcceptorMatching(a: Proposal, b: Proposal): boolean {
        return (isUserMatching(a.proposer, b.proposer)
            && isUserMatching(a.receiver, b.receiver))
            || (isUserMatching(a.proposer, b.receiver)
                && isUserMatching(a.receiver, b.proposer));

        function isUserMatching(a?: User, b?: User): boolean {
            if (a === b) {
                return true;
            }
            if (a === undefined || b === undefined) {
                return false;
            }
            return a.key === b.key;
        }
    }
}