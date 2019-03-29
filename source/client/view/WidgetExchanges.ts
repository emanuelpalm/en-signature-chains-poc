import {Model} from "../model";
import {WidgetCard} from "./WidgetCard";
import {WidgetLink} from "./WidgetLink";
import {WidgetListCached} from "./WidgetListCached";
import {WidgetExpression} from "./WidgetExpression";
import {xnet} from "../../model";

export class WidgetExchanges extends WidgetListCached<xnet.Exchange, WidgetCard> {
    public constructor(
        private readonly model: Model
    )
    {
        super(model.exchanges(), "section", "en-exchanges");
    }

    protected onItemCreate(): WidgetCard {
        return new WidgetCard()
            .addEntry("hash")
            .addEntry("predecessor")
            .addEntry("proposal")
            .addEntry()
            .addEntry("proposer")
            .addEntry("acceptor");
    }

    protected onItemRemove(view: WidgetCard): void {
        view.clearCallbacks();
    }

    protected onItemUpdate(view: WidgetCard, item: xnet.Exchange): void {
        view
            .setEntry(0, item.hash.digest, "en-id")
            .setEntry(1, item.acceptance.proposal.predecessor !== undefined
                ? item.acceptance.proposal.predecessor.digest
                : "0", "en-id")
            .setEntry(3, new WidgetCard("en-proposal")
                .addEntry("wants")
                .addEntry("gives")
                .setEntry(0, new WidgetExpression(item.acceptance.proposal.wants))
                .setEntry(1, new WidgetExpression(item.acceptance.proposal.gives)))
            .setEntry(4, new WidgetLink("#" + item.acceptance.proposal.proposer, "user",
                [item.acceptance.proposal.proposer]))
            .setEntry(5, new WidgetLink("#" + item.acceptance.proposal.receiver, "user",
                [item.acceptance.proposal.receiver]));

        this.model.users()
            .nameByKey(item.acceptance.proposal.proposer)
            .then(name => {
                if (typeof name === "string") {
                    view.setEntry(4, new WidgetLink(name, "user",
                        [item.acceptance.proposal.proposer]));
                }
            });

        this.model.users()
            .nameByKey(item.acceptance.proposal.receiver)
            .then(name => {
                if (typeof name === "string") {
                    view.setEntry(5, new WidgetLink(name, "user",
                        [item.acceptance.proposal.receiver]));
                }
            });
    }

    protected readonly renderHeader = undefined;
    protected readonly renderFooter = undefined;
}