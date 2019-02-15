import {LogEntry} from "../../model";

/**
 * Singleton log entry broker, useful for distributing errors and other log data.
 */
export class LogBroker {
    private static _instance: LogBroker | undefined;

    private readonly subscribers: Set<(entry: LogEntry) => void> = new Set();

    private constructor() {}

    /**
     * Called to notify broker subscribers about a new log entry.
     *
     * @param entry Logged data.
     */
    public publish(entry: LogEntry): void {
        for (const subscriber of this.subscribers) {
            subscriber(entry);
        }
    }

    /**
     * @param subscriber Entity to receive published updates.
     */
    public subscribe(subscriber: (entry: LogEntry) => void): void {
        this.subscribers.add(subscriber);
    }

    /**
     * @param subscriber Entity to no longer receive published updates.
     * @return Whether or not `subscriber` was subscribing.
     */
    public unsubscribe(subscriber: (entry: LogEntry) => void): boolean {
        return this.subscribers.delete(subscriber);
    }

    /**
     * Gets singleton `LinkBroker` instance.
     */
    public static instance(): LogBroker {
        if (LogBroker._instance === undefined) {
            LogBroker._instance = new LogBroker();
        }
        return LogBroker._instance;
    }
}