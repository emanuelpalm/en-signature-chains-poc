/**
 * A logger entry.
 */
export interface LogEntry {
    /**
     * The number of milliseconds since the Unix epoch this entry was created.
     */
    timestamp?: number,

    /**
     * Entry title.
     */
    title: string,

    /**
     * Entry data, if any.
     */
    data: any,
}

/**
 * Determines if given value is a `LogEntry`.
 *
 * @param any Checked value.
 * @return Whether `any` is of type `LogEntry`.
 */
export function isLogEntry(any: any): any is LogEntry {
    return typeof any === "object" && any !== null
        && typeof any.title === "string"
        && typeof any.data !== "undefined";
}

/**
 * Sets the timestamp field of given `entry` to the current time, unless the
 * field is already set.
 *
 * @param entry Entry to timestamp.
 */
export function setLogEntryTimestampIfEmpty(entry: LogEntry) {
    if (entry.timestamp === undefined) {
        entry.timestamp = Date.now();
    }
}