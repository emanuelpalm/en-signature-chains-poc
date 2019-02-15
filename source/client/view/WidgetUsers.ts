import {LogBroker} from "./LogBroker";
import {Model} from "../model";
import {LinkBroker} from "./LinkBroker";
import {WidgetCard} from "./WidgetCard";
import {WidgetListCached} from "./WidgetListCached";
import {User} from "../../model";

export class WidgetUsers extends WidgetListCached<User, WidgetCard> {
    public constructor(
        private readonly model: Model
    )
    {
        super(model.users(), "section", "en-users");
        LinkBroker.instance()
            .filter(command => command === "user")
            .subscribe(async (user, key) => {
                    try {
                        const index = await this.model.users().indexByKey(key);
                        if (index < 0) {
                            return;
                        }
                        const view = this.item(index);
                        if (view === undefined) {
                            return;
                        }
                        LinkBroker.instance().publish("pane", "registry");
                        view.focus();
                    }
                    catch (error) {
                        LogBroker.instance().publish({title: "user", data: error});
                    }
                });
    }

    protected onItemCreate(): WidgetCard {
        return new WidgetCard()
            .addEntry()
            .addEntry("key")
            .addEntry("info");
    }

    protected onItemRemove(view: WidgetCard): void {
        view.clearCallbacks();
    }

    protected onItemUpdate(view: WidgetCard, item: User): void {
        const me = this.model.me().primary();
        view.setState(me.key === item.key ? "me" : "other");
        view
            .setEntry(0, item.name)
            .setEntry(1, item.key, "en-id")
            .setEntry(2, item.attributes || "∅");
    }

    protected readonly renderHeader = undefined;
    protected readonly renderFooter = undefined;
}