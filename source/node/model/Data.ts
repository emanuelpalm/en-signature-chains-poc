import {List} from "../../util";

/**
 * A data interface, exposing its data as a list of items.
 */
export interface Data<T> extends List<T> {
    /**
     * Unique collection identifier.
     */
    name: string,
}