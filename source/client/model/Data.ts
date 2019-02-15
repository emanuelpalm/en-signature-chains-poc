import {ListCached} from "../../util";

/**
 * A named data interface, exposing its data as a list of items.
 */
export interface Data<T = any> extends ListCached<T> {
    /**
     * Unique collection identifier.
     */
    name: string;
}