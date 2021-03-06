import {Data} from "./Data";
import {ListArray} from "../../util";
import {Any, User, xnet} from "../../model";

export class DataExchanges
    extends ListArray<xnet.Exchange>
    implements Data<xnet.Exchange>
{
    public name: "exchanges";

    public constructor() {
        super();
        this.name = "exchanges";
    }

    public getPredecessorFor(a: User, b: User): xnet.Exchange | undefined {
        for (const item of this.items()) {
            if (isPredecessorFor(item, a, b)) {
                return item;
            }
        }
        return undefined;

        function isPredecessorFor(exchange: xnet.Exchange, a: User, b: User): boolean {
            const x = exchange.acceptance.proposal.receiver;
            const y = exchange.acceptance.proposal.proposer;
            return a.key !== b.key
                && (x === a.key || x === b.key)
                && (y === a.key || y === b.key);
        }
    }

    public getByTokenID(tokenID: string): xnet.Exchange[] {
        const result: xnet.Exchange[] = [];
        for (const item of this.items()) {
            if (xnet.isProposalContainingTokenID(item.acceptance.proposal, tokenID)) {
                result.push(item);
            }
        }
        return result;
    }

    public update(exchange: xnet.Exchange): boolean {
        for (const item of this.items()) {
            if (Any.deepEqual(item.hash, exchange.hash)) {
                return false;
            }
        }
        this.splice(0, 0, exchange);
        return true;
    }
}