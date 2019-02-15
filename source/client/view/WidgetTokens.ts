import {Model} from "../model";
import {WidgetCard} from "./WidgetCard";
import {WidgetListCached} from "./WidgetListCached";
import {WidgetLink} from "./WidgetLink";
import {User, xnet} from "../../model";
import {WidgetToken} from "./WidgetToken";

export class WidgetTokens extends WidgetListCached<[User, xnet.Token], WidgetCard> {
    public constructor(
        private readonly model: Model
    )
    {
        super(model.tokens(), "section", "en-tokens");
    }

    protected onItemCreate(): WidgetCard {
        return new WidgetCard()
            .addEntry("owner")
            .addEntry("token");
    }

    protected onItemRemove(view: WidgetCard): void {
        view.clearCallbacks();
    }

    protected onItemUpdate(view: WidgetCard, item: [User, xnet.Token]): void {
        const [from, token] = item;
        view
            .clearActions()
            .setEntry(0, new WidgetLink(from.name, "user", [from.key]))
            .setEntry(1, new WidgetToken(token));
    }

    protected readonly renderHeader = undefined;
    protected readonly renderFooter = undefined;
}