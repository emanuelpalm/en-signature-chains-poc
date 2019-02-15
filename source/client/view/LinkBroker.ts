/**
 * Singleton `LinkObservable`, useful for observing `ViewLink` events.
 */
export class LinkBroker {
    private static _instance: LinkBroker | undefined;

    private readonly subscribers: Set<(command: string, ...args: string[]) => void>;

    public constructor() {
        this.subscribers = new Set();
    }

    /**
     * Called to notify broker subscribers about some link being followed.
     *
     * @param command Link command.
     * @param args Any link command arguments.
     */
    public publish(command: string, ...args: string[]): void {
        for (const subscriber of this.subscribers) {
            subscriber(command, ...args);
        }
    }

    /**
     * @param subscriber Entity to receive published updates.
     */
    public subscribe(subscriber: (command: string, ...args: string[]) => void): void {
        this.subscribers.add(subscriber);
    }

    /**
     * @param subscriber Entity to no longer receive published updates.
     * @return Whether or not `subscriber` was subscribing.
     */
    public unsubscribe(subscriber: (command: string, ...args: string[]) => void): boolean {
        return this.subscribers.delete(subscriber);
    }

    /**
     * Creates new `LinkBroker` that only publishes events that passes given
     * filter `f`.
     *
     * @param f Function returning `true` only for desired events.
     * @return New `LinkBroker`.
     */
    public filter(f: (command: string, ...args: string[]) => boolean): LinkBroker {
        const broker = new LinkBroker();
        this.subscribe((command, ...args) => {
            if (f(command, ...args)) {
                broker.publish(command, ...args);
            }
        });
        return broker;
    }

    /**
     * Gets singleton `LinkBroker` instance.
     */
    public static instance(): LinkBroker {
        if (LinkBroker._instance === undefined) {
            LinkBroker._instance = new LinkBroker();
        }
        return LinkBroker._instance;
    }
}