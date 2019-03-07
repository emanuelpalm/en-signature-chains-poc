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
     * Gets token templates with types matching `type`.
     *
     * @param type Type searched for.
     * @return Promise of search result.
     */
    public getByType(type: string,): TokenTemplate | undefined {
        for (const template of this.items()) {
            if (template.type === type) {
                return template;
            }
        }
        return undefined;
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
        const tokenTemplate = this.getByType(token.type);
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
        const tokenTemplate = this.getByType(token.type);
        if (tokenTemplate === undefined || !tokenTemplate.isQualifiable) {
            throw new Error("Token not qualifiable: " + JSON.stringify(token));
        }
        const clone = Any.clone(token);
        clone.id = randomString(20, tokenTemplate.idPrefix || "");
        return clone;
    }
}