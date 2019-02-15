import {Model} from "../../model";
import {User} from "../../../model";

/**
 * Token expression builder data context.
 */
export interface Context {
    /// Client model.
    model: Model,

    /// Owner of built expression, if any.
    owner?: User,
}