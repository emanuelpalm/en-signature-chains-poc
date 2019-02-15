import {Data} from "./Data";
import {ListArray} from "../../util";
import {User, xnet} from "../../model";

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
            const x = exchange.acceptance.acceptor;
            const y = exchange.acceptance.proposal.proposer;
            return a.key !== b.key
                && (x === a.key || x === b.key)
                && (y === a.key || y === b.key);
        }
    }
}