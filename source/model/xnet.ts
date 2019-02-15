import {Any} from "./Any";

/**
 * The data types mentioned in the paper "The Exchange Network: A Functional
 * Architecture for Digital Negotiation and Ownership Exchange".
 */
export namespace xnet {
    /**
     * An accepted `Proposal`.
     */
    export interface Acceptance {
        /**
         * The accepted `Proposal`.
         */
        proposal: Proposal;

        /**
         * The public key of the user that accepted `proposal`.
         *
         * This user gives up the tokens in `proposal.want`, and receives
         * ownership of the tokens in `proposal.give`.
         */
        acceptor: ID;

        /**
         * The signature of the `acceptor`.
         */
        signature: Signature;
    }

    /**
     * An `Acceptance` without a `signature`.
     */
    export type AcceptanceUnsigned =
        Pick<Acceptance, Exclude<keyof Acceptance, "signature">>;

    /**
     * A set of alternatives where _all_ `Expression`s must be chosen.
     */
    export interface And {
        type: "__and",
        items: Expression[];
    }

    /**
     * Represents a finalized `Token` exchange.
     *
     * While the type may seem rather empty, it is important since it could hold
     * details not known during acceptance, but that are learned during proposal
     * finalization.
     */
    export interface Exchange {
        /**
         * An accepted and finalized proposal.
         */
        acceptance: Acceptance;

        /**
         * The hash of the canonical form of the `Exchange`.
         */
        hash: Hash,
    }

    /**
     * A `Proposal` expression.
     */
    export type Expression = null | Token | And | Or | Not;

    /**
     * A hash.
     */
    export interface Hash {
        /**
         * String representation of hashing algorithm used to produce `value`.
         */
        algorithm: string,

        /**
         * Hash sum, produced by feeding a string into the hashing algorithm
         * identified by `algorithm`.
         */
        digest: ID,
    }

    /**
     * A string identifier.
     */
    export type ID = string;

    /**
     * The logical inverse of its contents.
     */
    export interface Not {
        type: "__not",
        item: Expression,
    }

    /**
     * A set of alternatives where _at least one_ `Expression` must be chosen.
     */
    export interface Or {
        type: "__or",
        items: Expression[];
    }

    /**
     * A `Token` exchange proposal.
     */
    export interface Proposal {
        /**
         * Identifies the creator of the proposal.
         */
        proposer: ID,

        /**
         * A description of what tokens are desired, if any.
         */
        wants: Expression,

        /**
         * A description of what tokens are offered in return for the desired such,
         * if any.
         */
        gives: Expression,

        /**
         * Identifies a contract or other type definition.
         */
        definition?: Hash,

        /**
         * The hash of the last `Exchange`, if relevant, finalized by the same
         * users as are sending and receiving this `Proposal`. The `Exchange`
         * should contain a `Proposal` referring to the same `contract` as this
         * one.
         */
        predecessor?: Hash,

        /**
         * The proposing user's signature of this proposal.
         */
        signature: Signature,
    }

    /**
     * A `Proposal` without a `signature`.
     */
    export type ProposalUnsigned = Pick<Proposal, Exclude<keyof Proposal, "signature">>;

    /**
     * An cryptographic signature, produced by encrypting the hash of some
     * serialized object with a private key.
     *
     * To verify an exchange signature, the `User` that signed it and the
     * signed serialized object must be known from the context the signature was
     * found.
     */
    export interface Signature {
        /**
         * The textual representation of the hash algorithm used to produce
         * `signature`.
         */
        hashAlgorithm: string;

        /**
         * The actual signature.
         */
        digest: ID;
    }

    /**
     * Represents an ownable material or immaterial entity.
     *
     * Tokens are divided into two significant categories, _qualified_ and
     * _unqualified_. The former category has an `id`, which makes it identify one
     * particular entity, while the former category lacks an `id` and thereby refer
     * to any entity of the stated `type`.
     *
     * The implications of owning a particular token is determined by the
     * interpretation of its `type` in combination with any characteristics
     * specified in its `data` field. Both users of an exchange must share a
     * common notion of what owning or giving up ownership of each `type` of
     * relevant token.
     */
    export interface Token {
        /**
         * An identifier uniquely identifying a particular entity, if given.
         */
        id?: ID,

        /**
         * A string identifying the general category of this entity.
         */
        type: string,

        /**
         * An arbitrary data structure distinguishing the entity from other of the
         * same `type`.
         */
        data?: any,
    }

    /**
     * Describes something wanted and something given.
     */
    export interface WantsGives {
        wants: Expression,
        gives: Expression,
    }

    /**
     * Accumulates all tokens in `expr` into array.
     *
     * @param expr Expression to collect tokens form.
     * @return Collected tokens.
     */
    export function getTokensFrom(expr: Expression): Token[] {
        const tokens: Token[] = [];
        inner(expr, tokens);
        return tokens;

        function inner(expr: Expression, acc: Token[]): void {
            if (expr === null) {
                return;
            }
            if (isExpressionToken(expr)) {
                acc.push(expr);
                return;
            }
            if (isExpressionAnd(expr) || isExpressionOr(expr)) {
                for (const item of expr.items) {
                    inner(item, acc)
                }
                return;
            }
            inner(expr.item, acc);
        }
    }

    /**
     * Determines if given value is an `Exchange`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `Exchange`.
     */
    export function isAcceptance(any: any): any is Acceptance {
        return typeof (<Acceptance>any) === "object" && (<Acceptance>any) !== null
            && isProposal((<Acceptance>any).proposal)
            && isID((<Acceptance>any).acceptor)
            && isSignature((<Acceptance>any).signature);
    }

    /**
     * Determines if given value is an `Exchange`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `Exchange`.
     */
    export function isExchange(any: any): any is Exchange {
        return typeof (<Exchange>any) === "object" && (<Exchange>any) !== null
            && isAcceptance((<Exchange>any).acceptance)
            && isHash((<Exchange>any).hash);
    }

    /**
     * Determines if given value is a `Expression`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `Expression`.
     */
    export function isExpression(any: any): any is Expression {
        return (<Expression>any) === null ||
            (typeof any === "object" && typeof any.type === "string" && (
                (
                    ((<Token | And | Or | Not>any).type in ["__and", "__or"])
                    && Array.isArray((<And | Or>any).items)
                    && (<And | Or>any).items
                        .find((item: any) => !isExpression(item)) === undefined
                ) ||
                (
                    (<Not>any).type === "__not" && isExpression(any.item)
                ) ||
                (
                    (<Token>any).type.length > 0
                )
            ));
    }

    /**
     * Checks whether given `expr` represent a single `Token`.
     *
     * @param expr Checked `Expression`.
     * @returns Whether given `Expression` is of type `Token`.
     */
    export function isExpressionToken(expr: Expression): expr is Token {
        return expr !== null && !expr.type.startsWith("__");
    }

    /**
     * Checks whether given `expr` is a `Token` AND expression.
     *
     * @param expr Checked `Expression`.
     * @returns Whether given `Expression` is of type `And`.
     */
    export function isExpressionAnd(expr: Expression): expr is And {
        return expr !== null && expr.type === "__and";
    }

    /**
     * Checks whether given `expr` is a `Token` IOR expression.
     *
     * @param expr Checked `Expression`.
     * @returns Whether given `Expression` is of type `TokenIOR`.
     */
    export function isExpressionOr(expr: Expression): expr is Or {
        return expr !== null && expr.type === "__or";
    }

    /**
     * Checks whether given `expr` is a `Token` NOT expression.
     *
     * @param expr Checked `Expression`.
     * @returns Whether given `Expression` is of type `Not`.
     */
    export function isExpressionNot(expr: Expression): expr is Not {
        return expr !== null && expr.type === "__not";
    }

    /**
     * Checks whether given `expr` represent a _qualified_ `Token` expression.
     *
     * @param expr Checked `Expression`.
     * @returns Whether given `Expression` is qualified.
     */
    export function isExpressionQualified(expr: Expression): boolean {
        if (isExpressionToken(expr)) {
            return isTokenQualified(expr);
        }
        if (isExpressionAnd(expr)) {
            return expr.items.every(t => isExpressionQualified(t));
        }
        return false;
    }

    /**
     * Checks whether given `expr` is a total rejection.
     *
     * A total rejection contains only tokens tokens that are not wanted or not
     * offered.
     *
     * @param expr Checked `Expression`.
     * @returns Whether given `Expression` is a total rejection.
     */
    export function isExpressionRejection(expr: Expression): boolean {
        return inner(expr, false);

        function inner(expr: Expression, negative: boolean): boolean {
            if (expr === null) {
                return false;
            }
            if (isExpressionToken(expr)) {
                return negative;
            }
            if (isExpressionAnd(expr) || isExpressionOr(expr)) {
                for (const item of expr.items) {
                    if (!inner(item, negative)) {
                        return false;
                    }
                }
                return negative;
            }
            return inner(expr.item, !negative);
        }
    }

    /**
     * Checks whether given `expr` is a _satisfiable_ expression.
     *
     * The Boolean satisfiability problem is NP hard, and this function uses a
     * rather naive approach to checking whether given expressions are indeed
     * satisfiable. This means that performance will degrade quickly for larger
     * token expressions. If performance would be very important, then there is
     * likely plenty of room for improving this implementation. Also, the
     * application could be made to simply reject larger expressions without
     * checking them.
     *
     * @param expr Checked `Expression`.
     * @returns Whether given `Expression` is satisfiable.
     */
    export function isExpressionSatisfiable(expr: Expression): boolean {
        interface Registry {
            count: number,
            nameToId: Map<string, number>,
        }

        type Expr = number | [string, any];

        const registry: Registry = {count: 0, nameToId: new Map<string, number>()};
        const pef = intoPEF(expr, registry);
        const nnf = intoNNF(pef);
        const cnf = intoCNF(nnf);
        return solveCNF(cnf, registry.count);

        // Expression into Predicate Expression Form (PEF).
        //
        // The function transforms the token expression into a simpler nested
        // data structure, where tokens are replaced with positive integers (>0)
        // referred to as literals.
        function intoPEF(expr: Expression, registry: Registry): Expr {
            if (isExpressionToken(expr)) {
                let name = expr.type.replace(/([.:])/, "\\$1");
                if (expr.id !== undefined) {
                    name += "." + expr.id;
                }
                else {
                    // Each `Token` without an `id` is considered a unique variable.
                    name += ":" + registry.count;
                }
                return nameToId(name);
            }
            if (expr === null) {
                return nameToId("");
            }
            if (isExpressionNot(expr)) {
                return [expr.type, intoPEF(expr.item, registry)];
            }
            return [expr.type, expr.items.map(item => intoPEF(item, registry))];

            function nameToId(name: string): number {
                let id = registry.nameToId.get(name);
                if (id === undefined) {
                    id = ++registry.count;
                    registry.nameToId.set(name, id);
                }
                return id;
            }
        }

        // PEF into Negation Normal Form (NNF).
        //
        // Removes NOT expressions by transforming AND and IOR expressions and
        // negating relevant literals. Finally, it replaces the expression
        // identifiers with "&" (AND) and "|" (OR), for the sake of brevity.
        //
        // See: https://en.wikipedia.org/wiki/Conjunctive_normal_form
        function intoNNF(pef: Expr, neg = false): Expr {
            if (typeof pef === "number") {
                return neg ? -pef : pef;
            }
            switch (pef[0]) {
            case "__not":
                return intoNNF(pef[1], !neg);

            case "__and":
                return [neg ? "|" : "&", pef[1]
                    .map((item: any) => intoNNF(item, neg))];

            case "__or":
                return [neg ? "&" : "|", pef[1]
                    .map((item: any) => intoNNF(item, neg))];

            default:
                throw new Error("Unreachable!");
            }
        }

        // NNF into Conjunctive Normal Form (CNF).
        //
        // Flattens the given NNF expression by merging nested ANDs and ORs, as
        // well as by distributing ORs inwards over ANDs (P OR (Q AND R) ->
        // (P OR Q) AND (P OR R)). Finally, normalizes the resulting expression
        // to make it consumable by the solveCNF() function.
        //
        // See: https://en.wikipedia.org/wiki/Conjunctive_normal_form
        function intoCNF(nnf: Expr): number[][] {
            return normalize(flatten(nnf));

            function flatten(nnf: Expr): any {
                if (isLiteral(nnf)) {
                    return nnf;
                }
                const [type, items] = nnf;
                switch (type) {
                case "&":
                    return ["&", items.reduce((result: any, item: any) => {
                        item = flatten(item);
                        return result.concat(isAND(item) ? item[1] : [item]);
                    }, [])];

                case "|":
                    if (items.length === 1) {
                        return flatten(items[0]);
                    }
                    for (let i = 0; i < items.length; ++i) {
                        const item = items[i];
                        if (isAND(item)) {
                            const transform = (i === 0)
                                ? distribute(items[1], item[1], items.slice(2))
                                : distribute(items[0], item[1], [
                                    ...items.slice(1, i),
                                    ...items.slice(i + 1),
                                ]);
                            return flatten(transform);
                        }
                    }
                    return ["|", items.map((item: any) => {
                        return isLiteral(item) ? item : flatten(item[1]);
                    })];

                default:
                    throw new Error("Unreachable!");
                }
            }

            function distribute(p: Expr, Q: Expr[], T: Expr[]): Expr {
                const [q, r, ...S] = Q;
                let transform: Expr = ["&", [["|", p, q], ["|", p, r], ...S]];
                if (T.length > 0) {
                    transform = ["|", transform, ...T] as Expr;
                }
                return transform;
            }

            function isLiteral(x: Expr): x is number {
                return typeof x === "number";
            }

            function isAND(x: Expr): boolean {
                return Array.isArray(x) && x[0] === "&";
            }

            function isOR(x: Expr): boolean {
                return Array.isArray(x) && x[0] === "|";
            }

            function normalize(root: any): number[][] {
                if (isLiteral(root)) {
                    return [[root]];
                }
                if (isOR(root)) {
                    return [root[1]];
                }
                return root[1].map((clause: any) => Array.isArray(clause)
                    ? clause[1]
                    : [clause]);
            }
        }

        // Solve CNF clauses, which refer to n different variables.
        //
        // Performs a recursive binary tree search of all variable combinations.
        // Could be improved in many ways for improved performance.
        function solveCNF(clauses: number[][], n: number): boolean {
            if (n < 1) {
                return true;
            }
            return branch(new Array(n), 0, clauses);

            function branch(vars: boolean[], off: number, c: number[][]): boolean {
                if (vars.length <= off) {
                    return true;
                }
                vars[off] = true;
                if (evaluate(vars, off + 1, c)) {
                    return true;
                }
                vars[off] = false;
                return evaluate(vars, off + 1, c);
            }

            function evaluate(vars: boolean[], off: number, c: number[][]): boolean {
                outer: for (const clause of c) {
                    for (const literal of clause) {
                        if (test(vars, off, literal)) {
                            continue outer;
                        }
                    }
                    return false;
                }
                return branch(vars, off, c);
            }

            function test(vars: any[], offset: number, literal: number): boolean {
                return literal > offset
                    || literal > 0 && vars[literal - 1]
                    || literal < 0 && !vars[-literal - 1];
            }
        }
    }

    /**
     * Determines if given value is a `Hash`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `Hash`.
     */
    export function isHash(any: any): any is Hash {
        return typeof (<Hash>any) === "object" && (<Hash>any) !== null
            && typeof (<Hash>any).algorithm === "string"
            && (<Hash>any).algorithm.length > 0
            && isID((<Hash>any).digest);
    }

    /**
     * Determines if given value is an `ID`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `ID`.
     */
    export function isID(any: any): any is ID {
        return typeof (<ID>any) === "string";
    }

    /**
     * Determines if given value is a `Proposal`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `Proposal`.
     */
    export function isProposal(any: any): any is Proposal {
        return typeof (<Proposal>any) === "object" && (<Proposal>any) !== null
            && isID((<Proposal>any).proposer)
            && isExpression((<Proposal>any).wants)
            && isExpression((<Proposal>any).gives)
            && ((<Proposal>any).definition === undefined
                || isHash((<Proposal>any).definition))
            && ((<Proposal>any).predecessor === undefined
                || isHash((<Proposal>any).predecessor))
            && isSignature((<Proposal>any).signature);
    }

    /**
     * Checks whether given `proposal` contains nothing wanted and nothing
     * given.
     *
     * @param proposal Checked `Proposal`.
     */
    export function isProposalEmpty(proposal: WantsGives): boolean {
        return proposal.wants === null && proposal.gives === null;
    }

    /**
     * Checks whether given `proposal` is qualified.
     *
     * @param proposal Checked `Proposal`.
     * @returns Whether `proposal` is qualified.
     */
    export function isProposalQualified(proposal: WantsGives): boolean {
        return isExpressionQualified(proposal.wants)
            && isExpressionQualified(proposal.gives);
    }

    /**
     * Checks whether or not given `proposal` is a complete rejection or not.
     *
     * A complete rejection contains only tokens that are __not__ wanted and
     * __not__ given.
     *
     * @param proposal Checked `Proposal`.
     * @returns Whether `proposal` is a total rejection.
     */
    export function isProposalRejection(proposal: WantsGives): boolean {
        return (proposal.wants !== null || proposal.gives !== null)
            && (proposal.wants === null || isExpressionRejection(proposal.wants))
            && (proposal.gives === null || isExpressionRejection(proposal.gives));
    }

    /**
     * Checks whether given `proposal` is satisfiable.
     *
     * @param proposal Checked `Proposal`
     * @returns Whether `proposal` is valid.
     */
    export function isProposalSatisfiable(proposal: WantsGives): boolean {
        const combination = {type: "__and", items: [proposal.wants, proposal.gives]};
        return isEveryQualifiedTokenUnique(combination)
            && isExpressionSatisfiable(proposal.wants)
            && isExpressionSatisfiable(proposal.gives);

        function isEveryQualifiedTokenUnique(
            expr: Expression,
            ids = new Set<string>()
        ): boolean
        {
            if (expr === null) {
                return true;
            }
            if (isExpressionToken(expr)) {
                if (expr.id !== undefined) {
                    if (ids.has(expr.id)) {
                        return false;
                    }
                    ids.add(expr.id);
                }
                return true;
            }
            if (isExpressionAnd(expr) || isExpressionOr(expr)) {
                return expr.items.findIndex(item => {
                    return !isEveryQualifiedTokenUnique(item, ids);
                }) === -1;
            }
            return isEveryQualifiedTokenUnique(expr.item, ids);
        }
    }

    /**
     * Determines whether or not `any` is a valid `Signature`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `Signature`.
     */
    export function isSignature(any: any): any is Signature {
        return typeof (<Signature>any) === "object" && (<Signature>any) !== null
            && typeof (<Signature>any).hashAlgorithm === "string"
            && isID((<Signature>any).digest);
    }

    /**
     * Determines if given value is a `Token`.
     *
     * @param any Checked value.
     * @return Whether `any` is of type `Token`.
     */
    export function isToken(any: any): any is Token {
        return typeof (<Token>any) === "object"
            && (<Token>any) !== null
            && ((<Token>any).id === undefined || isID((<Token>any).id))
            && typeof (<Token>any).type === "string";
    }

    /**
     * Determines if `a` and `b` are contain the same data, ignoring any IDs.
     *
     * @param a First compared token.
     * @param b Second compared token.
     * @return Whether `a` and `b` are equal, ignoring their IDs.
     */
    export function isTokenEqualToIgnoringIDs(a: Token, b: Token): boolean {
        if (a.type !== b.type) {
            return false;
        }
        return Any.deepEqual(a.data, b.data);
    }

    /**
     * Determines if `a` is a qualification of `b`.
     *
     * @param a A token.
     * @param b Another token.
     * @return Whether `a` is a qualification of `b`.
     */
    export function isTokenQualificationOf(a: Token, b: Token): boolean {
        if (a.type !== b.type) {
            return false;
        }
        return Any.containedIn(b.data, a.data);
    }

    /**
     * Checks whether given `token` is qualified.
     *
     * @param token Checked `Token`.
     * @returns Whether given `Token` is qualified.
     */
    export function isTokenQualified(token: Token): boolean {
        return typeof token.id === "string" && token.id.length > 0;
    }
}