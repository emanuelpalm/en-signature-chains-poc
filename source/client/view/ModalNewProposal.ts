import {Any, Proposal, User, xnet} from "../../model";
import {Modal} from "./Modal";
import {Model} from "../model";
import {WidgetCard} from "./WidgetCard";
import {WidgetSelect} from "./WidgetSelect";
import {WidgetTokenExprBuilder} from "./WidgetTokenExprBuilder";

export class ModalNewProposal extends Modal<boolean> {
    private isCancelled: boolean;

    public constructor(
        private readonly model: Model,
        private readonly to?: User,
        private readonly proposal: Proposal = {wants: null, gives: null},
    )
    {
        super();
        this.proposal = Any.clone(proposal);
        this.isCancelled = false;
    }

    protected _close(): Promise<boolean> {
        return Promise.resolve(!this.isCancelled);
    }

    protected _render(): HTMLElement {
        const me = this.model.me().primary();
        let selectedIndex = 0;
        const selectUser = new WidgetSelect<User>(
            user => user.name,
            this.model.users().slice().filter((user, index) => {
                if (user.key === me.key) {
                    selectedIndex -= 1;
                    return false;
                }
                else if (this.to !== undefined && this.to.key == user.key) {
                    selectedIndex += index;
                }
                return true;
            }),
            selectedIndex
        );
        const wants = new WidgetTokenExprBuilder(this.model, this.proposal.gives);
        const gives = new WidgetTokenExprBuilder(this.model, this.proposal.wants, me);
        const card = new WidgetCard("en-proposal")
            .addEntry()
            .addEntry()
            .addEntry("to")
            .addEntry("want")
            .addEntry("give")
            .addAction("Cancel")
            .addAction("Submit")
            .setEntry(0, "New Proposal", "title")
            .setEntry(2, selectUser, "select-user")
            .setEntry(3, wants, "en-overflow-initial")
            .setEntry(4, gives, "give")
            .setAction(0, async () => {
                this.isCancelled = true;
                this.close();
            })
            .setAction(1, async () => {
                const onError = (description: string) => {
                    card.setEntry(1, description, "error");
                };
                const receiver = selectUser.value();
                if (receiver === undefined) {
                    onError("No proposal receiver specified.");
                    return;
                }
                this.proposal.proposer = this.model.me().primary();
                this.proposal.receiver = receiver;
                this.proposal.wants = wants.tokenize();
                this.proposal.gives = gives.tokenize();
                if (!xnet.isProposalSatisfiable(this.proposal))
                {
                    onError("Formulated proposal is impossible to satisfy.");
                    return;
                }
                try {
                    await this.model.negotiator().propose(this.proposal);
                    await this.close();
                }
                catch (error) {
                    if (typeof error === "object" && error.message !== undefined) {
                        error = error.message;
                    }
                    if (typeof error !== "string") {
                        error = JSON.stringify(error);
                    }
                    onError("Failed to submit proposal: " + error);
                    return;
                }
            });

        return card.render();
    }
}