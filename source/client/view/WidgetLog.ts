import {LogEntry} from "../../model";
import {Model} from "../model";
import {WidgetCard} from "./WidgetCard";
import {WidgetListCached} from "./WidgetListCached";

export class WidgetLog extends WidgetListCached<LogEntry, WidgetCard> {
    public constructor(
        private readonly model: Model
    )
    {
        super(model.log(), "section", "en-log", "empty");
    }

    protected onItemCreate(): WidgetCard {
        return new WidgetCard()
            .addEntry()
            .addEntry()
            .addEntry();
    }

    protected onItemRemove(view: WidgetCard): void {
        view.clearCallbacks();
    }

    protected onItemUpdate(view: WidgetCard, item: LogEntry): void {
        view
            .setEntry(0, item.title, "title")
            .setEntry(1, new Date().toLocaleString(), "timestamp")
            .setEntry(2, item.data || "∅");
    }

    protected readonly renderHeader = undefined;

    protected renderFooter($root: HTMLElement): HTMLElement {
        const $toggle = document.createElement("button");
        $toggle.onclick = () => $root.classList.toggle("toggled");
        return $toggle;
    };

    protected _render(): HTMLElement {
        const $root = super._render();
        const log = this.model.log();
        const subscriber = {
            onSplice: (index: number, deleteCount: number, ...items: any[]) => {
                if (log.length() === 0 || (deleteCount + items.length === 0)) {
                    return;
                }
                $root.classList.remove("empty");
                log.unsubscribe(subscriber);
            },
        };
        log.subscribe(subscriber);
        return $root;
    }
}