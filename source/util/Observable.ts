/**
 * An object that publishes information to a set of subscribers.
 */
export abstract class Observable<T> {
    private readonly subscribers: Set<T> = new Set();

    /**
     * @param subscriber Entity to receive published data.
     */
    public subscribe(subscriber: T): void {
        this.subscribers.add(subscriber);
    }

    /**
     * @param subscriber Entity to no longer receive published data.
     * @return Whether or not `subscriber` was subscribing.
     */
    public unsubscribe(subscriber: T): boolean {
        return this.subscribers.delete(subscriber);
    }

    /**
     * Provides each subscriber to given function `f`.
     *
     * @param f Function invoked with each current subscriber.
     */
    protected forEachSubscriber(f: (subscriber: T) => void) {
        for (const subscriber of this.subscribers) {
            f(subscriber);
        }
    }
}