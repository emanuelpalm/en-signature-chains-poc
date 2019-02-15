import {Data} from "./Data";
import {ListCached} from "../../util";
import {ListAsyncRPC} from "../util";
import * as rpc from "../../rpc-json";
import {isUser, User, xnet} from "../../model";

/**
 * Represents the collection of all currently known users.
 */
export class DataUsers
    extends ListCached<User>
    implements Data<User>
{
    private static readonly NAME = "users";
    public readonly name: "users";

    /**
     * Creates new model for users.
     */
    public constructor(socket: rpc.Socket) {
        super(new ListAsyncRPC(socket, DataUsers.NAME, isUser));
        this.name = DataUsers.NAME;
    }

    /**
     * Searches for users with names matching any word in `terms`, which is
     * assumed to contain several keywords separated by spacing characters.
     *
     * @param terms Search terms.
     * @param limit Maximum number of desired search results.
     * @param exclude Users to exclude from search.
     * @return Promise of search result.
     */
    public async findByName(
        terms: string,
        limit: number,
        exclude: User[]
    ): Promise<User[]>
    {
        const results = [];
        const terms0 = terms.toLowerCase().split(/\s+/);
        for (const item of this.items()) {
            if (exclude.find(item0 => item.key === item0.key)) {
                continue;
            }
            const name = item.name.toLowerCase();
            for (const term of terms0) {
                if (term.length === 0) {
                    continue;
                }
                if (name.indexOf(term) >= 0) {
                    results.push(item);
                    break;
                }
            }
            if (results.length >= limit) {
                break;
            }
        }
        return results;
    }

    /**
     * Resolves the position of the user uniquely identified by `key`.
     *
     * If no matching user is available, a negative number is returned.
     *
     * @param key User identifier.
     * @return List position of matching `User`, or a negative number.
     */
    public async indexByKey(key: xnet.ID): Promise<number> {
        let i = 0;
        for (const item of this.items()) {
            if (item.key === key) {
                return i;
            }
            i++;
        }
        return -1;
    }

    /**
     * Resolves name of user uniquely identified by given `key`.
     *
     * @param key User identifier.
     * @return Promise of user name, or nothing if no such user could be found.
     */
    public async nameByKey(key: xnet.ID): Promise<string | undefined> {
        for (const item of this.items()) {
            if (item.key === key) {
                return item.name;
            }
        }
    }
}