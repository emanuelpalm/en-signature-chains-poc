import {Data} from "./Data";
import {Any, isTokenTemplate, TokenTemplate, xnet} from "../../model";
import {ListAsyncRPC} from "../util";
import {ListCached, randomString} from "../../util";
import * as rpc from "../../rpc-json";

/**
 * Represents a the collection of all currently known tokens, and their owners.
 */
export class DataTokenTemplates
    extends ListCached<TokenTemplate>
    implements Data<TokenTemplate>
{
    private static readonly NAME = "tokenTemplates";
    public readonly name: "tokenTemplates";

    /**
     * Creates new model for tokens.
     */
    public constructor(socket: rpc.Socket) {
        super(new ListAsyncRPC(socket, DataTokenTemplates.NAME, isTokenTemplate));
        this.name = DataTokenTemplates.NAME;
    }

    /**
     * Searches for token templates with kinds matching any word in `terms`,
     * which is assumed to contain several keywords separated by spacing
     * characters.
     *
     * @param terms Search terms.
     * @param limit Maximum number of desired search results.
     * @return Promise of search result.
     */
    public findByKind(
        terms: string,
        limit: number = 10,
    ): TokenTemplate[]
    {
        const results = [];
        const terms0 = terms.toLowerCase().split(/\s+/);
        for (const template of this.items()) {
            const kind = template.type.toLowerCase();
            for (const term of terms0) {
                if (term.length === 0) {
                    continue;
                }
                if (kind.indexOf(term) >= 0) {
                    results.push(template);
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
     * Determines if a template exists that allows the given `token` to be
     * qualified.
     *
     * @param token Token to qualify.
     * @return Whether `token` can be qualified.
     */
    public isQualifiable(token: xnet.Token): boolean {
        if (xnet.isTokenQualified(token)) {
            return false;
        }
        const tokenTemplate = this.findByKind(token.type, 1)[0];
        return tokenTemplate !== undefined && tokenTemplate.isQualifiable;
    }

    /**
     * Creates a qualified clone of given `token`.
     *
     * If no token template exists that allows tokens of the provided kind to
     * be qualified, the method throws an error.
     *
     * @param token Token to qualify.
     * @return A qualified clone of `token`.
     */
    public qualify(token: xnet.Token): xnet.Token {
        if (xnet.isTokenQualified(token)) {
            return Any.clone(token);
        }
        const tokenTemplate = this.findByKind(token.type, 1)[0];
        if (tokenTemplate === undefined || !tokenTemplate.isQualifiable) {
            throw new Error("Token not qualifiable: " + JSON.stringify(token));
        }
        const clone = Any.clone(token);
        clone.id = randomString(20, tokenTemplate.idPrefix || "");
        return clone;
    }
}