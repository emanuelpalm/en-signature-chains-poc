import {Data} from "./Data";
import {Any, isUser, User, xnet} from "../../model";
import {ListCached} from "../../util";
import * as rpc from "../../rpc-json";
import {ListAsyncRPC} from "../util";

/**
 * Represents a the collection of all currently known tokens, and their owners.
 */
export class DataTokens
    extends ListCached<[User, xnet.Token]>
    implements Data<[User, xnet.Token]>
{
    private static readonly NAME = "tokens";
    public readonly name: "tokens";

    /**
     * Creates new model for tokens.
     */
    public constructor(socket: rpc.Socket) {
        super(new ListAsyncRPC(socket, DataTokens.NAME,
            (v: any): v is [User, xnet.Token] => {
                if (!Array.isArray(v)) {
                    return false;
                }
                const [user, token] = v;
                return isUser(user) && xnet.isToken(token);
            }
        ));
        this.name = DataTokens.NAME;
    }

    /**
     * Searches for tokens with kinds matching any word in `terms`, which is
     * assumed to contain several keywords separated by spacing characters.
     *
     * @param owner User owning desired tokens.
     * @param terms Search terms.
     * @param limit Maximum number of desired search results.
     * @param exclude Tokens to exclude from search.
     * @return Promise of search result.
     */
    public findByKind(
        terms: string,
        limit: number = 10,
        exclude: xnet.Token[] = [],
        owner: User | null = null,
    ): xnet.Token[]
    {
        const results = [];
        const terms0 = terms.toLowerCase().split(/\s+/);
        for (const [user, token] of this.items()) {
            if (exclude.find(token0 => xnet.isTokenQualificationOf(token, token0))) {
                continue;
            }
            if (owner !== null && owner.key !== user.key) {
                continue;
            }
            const type = token.type.toLowerCase();
            for (const term of terms0) {
                if (term.length === 0) {
                    continue;
                }
                if (type.indexOf(term) >= 0) {
                    results.push(token);
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
     * Gets all tokens owned by given `user`.
     *
     * @param user User owning requested tokens.
     * @return All tokens owned by `user`.
     */
    public getAllOwnedBy(user: User): xnet.Token[] {
        const tokens: xnet.Token[] = [];
        for (const [user0, token] of this.items()) {
            if (user.key === user0.key) {
                tokens.push(token);
            }
        }
        return tokens;
    }

    /**
     * Determines if provided `owner` owns a known qualified token with a type
     * and data matching that of `token`.
     *
     * @param owner Owner of `token`.
     * @param token Token to qualify.
     * @return Whether `token` can be qualified.
     */
    public isQualifiable(owner: User, token: xnet.Token): boolean {
        if (xnet.isTokenQualified(token)) {
            return false;
        }
        for (const [owner0, token0] of this.items()) {
            if (owner0.key === owner.key && xnet.isTokenQualificationOf(token0, token)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Finds a token owned by `owner` that is a qualification of `token`.
     *
     * @param owner Owner of `token`.
     * @param token Token to qualify.
     * @return A qualified clone of `token`.
     */
    public qualify(owner: User, token: xnet.Token): xnet.Token {
        if (xnet.isTokenQualified(token)) {
            return Any.clone(token);
        }
        for (const [owner0, token0] of this.items()) {
            if (owner0.key === owner.key && xnet.isTokenQualificationOf(token0, token)) {
                return Any.clone(token0);
            }
        }
        throw new Error("Token not qualifiable: " + JSON.stringify(token));
    }
}