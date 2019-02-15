import {Model} from "./model";
import {
    LogBroker,
    LinkBroker,
    WidgetExchanges,
    WidgetLog, WidgetMe,
    WidgetPaneSelector,
    WidgetUsers,
    WidgetProposals,
    WidgetStatus,
    WidgetTabs,
    WidgetTokens
} from "./view";

window.addEventListener("load", () => {
    const model = new Model(
        window.location.hostname,
        parseInt(window.location.port || "80")
    );

    // Setup connection status indicator.
    {
        const status = new WidgetStatus("Connecting", "en-status-yellow");
        document.body.appendChild(status.render());
        model.subscribe({
            onConnected: async () => {
                status.set("Connected", "en-status-green");
                await model.refresh();
            },
            onDisconnected: () => status.set("Not Connected", "en-status-red"),
        });
    }

    // Setup log pane.
    {
        LogBroker.instance()
            .subscribe(entry => {
                model.log().splice(0, 0, entry);
                console.log("LOG", new Date(entry.timestamp || Date.now()),
                    entry.title, entry.data);
            });
        document.body.appendChild(new WidgetLog(model).render());
    }

    // Setup current user (me) widget.
    {
        document.body.appendChild(new WidgetMe(model).render());
    }

    // Setup main contents.
    {
        const panes = new WidgetPaneSelector(
            "Exchange Client", "en-body",
            ["User Registry", new WidgetTabs("User Registry", "en-body-registry",
                ["Users", new WidgetUsers(model)],
            )],
            ["Negotiation Service", new WidgetTabs("Negotiation Service", "en-body-messager",
                ["Proposals", new WidgetProposals(model)],
            )],
            ["Exchange Ledger", new WidgetTabs("Exchange Ledger", "en-body-ledger",
                ["Exchanges", new WidgetExchanges(model)],
                ["Tokens", new WidgetTokens(model)],
            )],
        );
        LinkBroker.instance()
            .filter(command => command === "pane")
            .subscribe((pane, name) => {
                let index;
                switch (name.toLowerCase()) {
                case "registry":
                    index = 0;
                    break;

                case "message":
                    index = 1;
                    break;

                case "ledger":
                    index = 2;
                    break;

                default:
                    return;
                }
                panes.select(index);
            });
        document.body.appendChild(panes.render());
    }
});