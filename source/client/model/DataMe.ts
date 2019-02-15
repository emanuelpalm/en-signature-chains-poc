import {Data} from "./Data";
import {ListAsyncRPC} from "../util";
import {ListCached} from "../../util";
import * as rpc from "../../rpc-json";
import {isUser, User, xnet} from "../../model";

/**
 * Represents the set of identities (typically one) used to represent the
 * client user.
 */
export class DataMe
    extends ListCached<User>
    implements Data<User>
{
    private static readonly NAME = "me";
    public readonly name: "me";

    /**
     * Creates new model for client user identities.
     */
    public constructor(socket: rpc.Socket) {
        super(new ListAsyncRPC(socket, DataMe.NAME, isUser));
        this.name = DataMe.NAME;
    }

    /**
     * Gets primary/default user identity.
     */
    public primary(): User {
        const primary = this.item(0);
        if (primary === undefined) {
            throw new Error("No primary user identity available.");
        }
        return primary;
    }

    /**
     * Gets owned user identity by its `key`.
     *
     * @param key Key searched for.
     * @return Matching client user, or `undefined`.
     */
    public getByKey(key: xnet.ID): User | undefined {
        for (const item of this.items()) {
            if (item.key === key) {
                return item;
            }
        }
        return undefined;
    }
}