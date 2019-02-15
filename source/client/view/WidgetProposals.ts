import {LogBroker} from "./LogBroker";
import {Model} from "../model";
import {ModalNewProposal} from "./ModalNewProposal";
import {User, Proposal, xnet} from "../../model";
import {WidgetCard} from "./WidgetCard";
import {WidgetLink} from "./WidgetLink";
import {WidgetListCached} from "./WidgetListCached";
import {WidgetExpression} from "./WidgetExpression";

export class WidgetProposals extends WidgetListCached<Proposal, WidgetCard> {
    public constructor(private readonly model: Model) {
        super(model.proposals(), "section", "en-proposals");
    }

    protected onItemCreate(): WidgetCard {
        return new WidgetCard()
            .addEntry("from")
            .addEntry("wants")
            .addEntry("gives");
    }

    protected onItemRemove(view: WidgetCard): void {
        view.clearCallbacks();
    }

    protected onItemUpdate(view: WidgetCard, item: Proposal): void {
        view
            .clearActions()
            .setEntry(1, new WidgetExpression(item.wants))
            .setEntry(2, new WidgetExpression(item.gives));

        const me = this.model.me();
        let state;
        if (item.proposer !== undefined && me.getByKey(item.proposer.key) === undefined) {
            const from = item.proposer;
            view.setEntry(0, new WidgetLink(from.name, "user", [from.key]));
            if (item.status === undefined) {
                if (!xnet.isProposalSatisfiable(item)) {
                    state = "unsatisfiable";
                }
                else if (xnet.isProposalRejection(item)) {
                    state = "discarded";
                }
                else if (!xnet.isProposalQualified(item)) {
                    state = "unqualified";
                    formatUnqualified(this.model, item, from);
                }
                else {
                    state = "qualified";
                    formatQualified(this.model, item);
                }
            }
            else {
                state = item.status;
            }
        }
        else if (item.receiver !== undefined) {
            const to = item.receiver;
            view.setEntryLabel(0, "to")
                .setEntry(0, new WidgetLink(to.name, "user", [to.key]));

            state = "sent";
        }
        else {
            state = "unknown";
        }
        view.setState(state);

        function formatQualified(model: Model, proposal: Proposal) {
            view
                .addAction("Discard", "proposal-discard")
                .addAction("Accept", "proposal-accept")
                .setAction(0, async () => model.negotiator()
                    .discard(proposal)
                    .then(() => toStateWithoutActions("discarded"))
                    .catch(error => LogBroker.instance()
                        .publish({title: "Proposal Discard Failed", data: error}))
                )
                .setAction(1, () => model.negotiator()
                    .accept(proposal)
                    .then(() => toStateWithoutActions("accepted"))
                    .catch(error => LogBroker.instance()
                        .publish({title: "Proposal Accept Failed", data: error}))
                );
        }

        function formatUnqualified(model: Model, proposal: Proposal, from: User) {
            view
                .addAction("Discard", "proposal-discard")
                .addAction("Qualify", "proposal-qualify")
                .setAction(0, async () => model.negotiator()
                    .discard(proposal)
                    .then(() => toStateWithoutActions("discarded"))
                    .catch(error => LogBroker.instance()
                        .publish({title: "Proposal Discard Failed", data: error}))
                )
                .setAction(1, () => new ModalNewProposal(model, from, proposal)
                    .open()
                    .then((submitted: boolean) => {
                        if (submitted) {
                            toStateWithoutActions("handled");
                        }
                    })
                    .catch(error => LogBroker.instance()
                        .publish({title: "Proposal Submission Failed", data: error}))
                );
        }

        function toStateWithoutActions(state: string) {
            view
                .clearActions()
                .clearCallbacks()
                .setState(state);
        }
    }

    protected renderHeader?(): HTMLElement {
        const $header = document.createElement("nav");
        $header.classList.add("header");

        const $button = document.createElement("button");
        $button.classList.add("new-proposal");
        $button.textContent = "New Proposal";
        $button.onclick = () => new ModalNewProposal(this.model).open();
        $header.appendChild($button);

        return $header;
    }

    protected readonly renderFooter = undefined;
}