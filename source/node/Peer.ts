import {Any, Proposal, ProposalStatus, User, xnet} from "../model";
import * as crypto from "crypto";
import * as http from "http";
import {Model} from "./model";
import * as parser from "body-reader";
import * as router from "find-my-way";

const HASH_ALGORITHM = "SHA1";

export class Peer {
    private readonly router: router.Instance<router.HTTPVersion.V1>;
    private readonly server: http.Server;

    public constructor(private readonly model: Model) {
        this.router = router();
        this.server = http.createServer();

        this.server.on("request", (req, res) => {
            this.router.lookup(req, res);
        });

        const parse = (req: http.IncomingMessage): Promise<any> => {
            return new Promise((resolve, reject) =>
                parser.Json.read(req, {limit: 1024 * 1024}, result => result.match({
                    Ok(data) {
                        try {
                            resolve(data);
                        }
                        catch (error) {
                            reject(error);
                        }
                    },
                    Err(error) {
                        reject(error)
                    },
                })));
        };

        const self = this;
        this.router.on("POST", "/proposals", (req, res) => parse(req).then(
            data => {
                if (!xnet.isProposal(data)) {
                    res.writeHead(400, "Not Proposal");
                    res.end();
                    return;
                }
                const proposer = model.users().getByKey(data.proposer);
                if (proposer === undefined) {
                    res.writeHead(400, "Sender Unknown");
                    res.end();
                    return;
                }
                if (!self.verifyProposal(data)) {
                    res.writeHead(400, "Bad Signature");
                    res.end();
                    return;
                }
                model.proposals().updateProposal({
                    proposer,
                    receiver: model.me().primary(),
                    wants: data.wants,
                    gives: data.gives,
                    definition: data.definition,
                    predecessor: data.predecessor,
                    signature: data.signature,
                });
                res.writeHead(200, "OK");
                res.end(JSON.stringify(data));
            },
            error => {
                model.log().push({
                    title: "Incoming Proposal Error",
                    data: error,
                });
                res.writeHead(400, "Proposal Error");
                res.end();
            }
        ));
        this.router.on("POST", "/acceptances", (req, res) => parse(req).then(
            data => {
                if (!xnet.isAcceptance(data)) {
                    res.writeHead(400, "Not Acceptance");
                    res.end();
                    return;
                }
                const acceptor = model.users().getByKey(data.acceptor);
                if (acceptor === undefined) {
                    res.writeHead(400, "Sender Unknown");
                    res.end();
                    return;
                }
                const me = model.me().primary();
                if (data.proposal.proposer !== me.key) {
                    res.writeHead(400, "Wrong Proposer");
                    res.end();
                    return;
                }
                if (!self.verifyAcceptance(data)) {
                    model.proposals().updateProposal({
                        receiver: acceptor,
                        proposer: me,
                        gives: data.proposal.gives,
                        wants: data.proposal.wants,
                        definition: data.proposal.definition,
                        predecessor: data.proposal.predecessor,
                        signature: data.proposal.signature,
                    }, ProposalStatus.Failed);
                    res.writeHead(400, "Bad Signatures");
                    res.end();
                    return;
                }
                self.ratifyAcceptance(data, me, acceptor);
                res.writeHead(204, "No Content");
                res.end();
            },
            error => {
                model.log().push({
                    title: "Incoming Acceptance Error",
                    data: error,
                });
                res.writeHead(400, "Acceptance Error");
                res.end();
            }
        ));
        this.router.on("POST", "/exchanges", (req, res) => parse(req).then(
            data => {
                if (!xnet.isExchange(data)) {
                    res.writeHead(400, "Not Exchange");
                    res.end();
                    return;
                }
                const acceptor = model.users().getByKey(data.acceptance.acceptor);
                if (acceptor === undefined) {
                    res.writeHead(400, "Sender Unkown");
                    res.end();
                    return;
                }
                const proposer = model.users().getByKey(data.acceptance.proposal.proposer);
                if (proposer === undefined) {
                    res.writeHead(400, "Proposer Unknown");
                    res.end();
                    return;
                }
                if (!self.verifyAcceptance(data.acceptance)) {
                    res.writeHead(400, "Bad Signatures");
                    res.end();
                    return;
                }
                this.model.exchanges().splice(0, 0, data);
                const proposal = data.acceptance.proposal;
                const tokens = this.model.tokens();
                xnet.getTokensFrom(proposal.wants).forEach(token => {
                    tokens.register(proposer, token);
                });
                xnet.getTokensFrom(proposal.gives).forEach(token => {
                    tokens.register(acceptor, token);
                });
            },
            error => {
                model.log().push({
                    title: "Incoming Exchange Error",
                    data: error,
                });
                res.writeHead(400, "Exchange Error");
                res.end();
            }
        ))
    }

    public close(): Promise<void> {
        return new Promise(resolve => {
            this.server.close(() => resolve());
        });
    }

    public listen(port?: number) {
        this.server.listen(port);
    }

    public propose(proposal: Proposal) {
        const onError = (description: string) => {
            this.logError("Proposal Error", {description, proposal}, proposal);
        };
        const f = async () => {
            try {
                if (proposal.receiver === undefined) {
                    return onError("Proposal receiver not set.");
                }
                if (proposal.proposer === undefined) {
                    return onError("Proposal sender not set.");
                }
                if (!xnet.isProposalSatisfiable(proposal)) {
                    return onError("Proposal not satisfiable.");
                }

                const [host, port] = this.getHostAndPortByReceiverKey(proposal.receiver.key);

                if (proposal.appendages !== undefined) {
                    await Promise.all(proposal.appendages.map(a => {
                        return this.sendExchangeTo(a, host, port);
                    }));
                }

                this.model.proposals().updateProposal(proposal, ProposalStatus.Sent);
                const proposal0 = this.signProposal({
                    proposer: proposal.proposer.key,
                    wants: proposal.wants,
                    gives: proposal.gives,
                    definition: undefined,
                    predecessor: Any.mapIfNotEmpty(this.model.exchanges()
                            .getPredecessorFor(proposal.receiver, proposal.proposer),
                        exchange => exchange.hash
                    ),
                });

                const payload = JSON.stringify(proposal0);
                const request = http.request({
                    host,
                    method: "POST",
                    path: "/proposals",
                    port,
                    headers: {
                        "Content-Length": Buffer.byteLength(payload),
                        "Content-Type": "application/json",
                    },
                });
                request.on("error", error => {
                    this.logError("Proposal Error", error, proposal);
                });
                request.on("response", (response: http.IncomingMessage) => {
                    const status = response.statusCode || 0;
                    if (status < 200 || status > 299) {
                        this.logError("Proposal Error", {
                            status: response.statusCode + " " + response.statusMessage,
                            headers: response.rawHeaders,
                        }, proposal);
                    }
                });
                request.end(payload);
            }
            catch (error) {
                this.logError("Proposal Error", error, proposal);
            }
        };
        f();
    }

    public accept(proposal: Proposal) {
        const onError = (description: string) => {
            this.logError("Acceptance Error", {description, proposal}, proposal);
        };
        try {
            if (proposal.receiver === undefined) {
                return onError("Proposal receiver not set.");
            }
            if (proposal.receiver.key !== this.model.me().primary().key) {
                return onError("Cannot accept proposal to another user.");
            }
            if (proposal.proposer === undefined) {
                return onError("Proposal sender not set.");
            }
            if (proposal.signature === undefined) {
                return onError("Proposal not signed.");
            }
            if (!xnet.isProposalQualified(proposal)) {
                return onError("Proposal not qualified.");
            }

            const acceptance: xnet.Acceptance = this.signAcceptance({
                proposal: {
                    proposer: proposal.proposer.key,
                    wants: proposal.wants,
                    gives: proposal.gives,
                    definition: proposal.definition,
                    predecessor: proposal.predecessor,
                    signature: proposal.signature,
                },
                acceptor: proposal.receiver.key,
            });
            const [host, port] = this.getHostAndPortByReceiverKey(
                acceptance.proposal.proposer
            );
            const payload = JSON.stringify(acceptance);
            const request = http.request({
                host,
                method: "POST",
                path: "/acceptances",
                port,
                headers: {
                    "Content-Length": Buffer.byteLength(payload),
                    "Content-Type": "application/json",
                },
            });
            request.on("error", error => {
                this.logError("Acceptance Error", error, proposal);
            });
            request.on("response", (response: http.IncomingMessage) => {
                const status = response.statusCode || 0;
                if (status < 200 || status > 299) {
                    this.logError("Acceptance Error", {
                        status: response.statusCode + " " + response.statusMessage,
                        headers: response.rawHeaders,
                    }, proposal);
                }
                else {
                    this.ratifyAcceptance(
                        acceptance,
                        proposal.proposer as User,
                        proposal.receiver as User
                    );
                }
            });
            request.end(payload);
        }
        catch (error) {
            this.logError("Acceptance Error", error, proposal);
        }
    }

    public discard(proposal: Proposal) {
        this.model.proposals().updateProposal(proposal, ProposalStatus.Discarded);
    }

    private sendExchangeTo(exchange: xnet.Exchange, host: string, port: number): Promise<void> {
        const payload = JSON.stringify(exchange);
        const request = http.request({
            host,
            method: "POST",
            path: "/exchanges",
            port,
            headers: {
                "Content-Length": Buffer.byteLength(payload),
                "Content-Type": "application/json",
            },
        });
        return new Promise((resolve, reject) => {
            request.on("error", error => {
                this.logError("Exchange Inform Error", error);
                reject(error);
            });
            request.on("response", (response: http.IncomingMessage) => {
                const status = response.statusCode || 0;
                if (status < 200 || status > 299) {
                    const error = {
                        status: response.statusCode + " " + response.statusMessage,
                        headers: response.rawHeaders,
                    };
                    this.logError("Exchange Inform Error", error);
                    reject(error);
                }
                else {
                    resolve();
                }
            });
            request.end(payload);
        });
    }

    private getHostAndPortByReceiverKey(key: xnet.ID): [string, number] {
        const user = this.model.users().getByKey(key);
        if (user === undefined) {
            throw {
                description: "No user associated with key.",
                key,
            };
        }
        const port = this.model.users().getHostAndPortOf(user);
        if (port === undefined) {
            throw {
                description: "User port not known.",
                user,
            };
        }
        return port;
    }

    private logError(title: string, error: any, proposal?: Proposal) {
        this.model.log().push({
            title,
            data: error,
        });
        if (proposal !== undefined) {
            this.model.proposals().updateProposal(proposal, ProposalStatus.Failed);
        }
    }

    private ratifyAcceptance(acceptance: xnet.Acceptance, proposer: User, acceptor: User) {
        this.model.exchanges().splice(0, 0, {
            acceptance,
            hash: {
                algorithm: HASH_ALGORITHM,
                digest: crypto.createHash(HASH_ALGORITHM)
                    .update(Any.canonicalStringOf({acceptance}))
                    .digest()
                    .toString("base64"),
            },
        });

        const proposal = acceptance.proposal;
        const tokens = this.model.tokens();
        xnet.getTokensFrom(proposal.wants).forEach(token => {
            tokens.register(proposer, token);
        });
        xnet.getTokensFrom(proposal.gives).forEach(token => {
            tokens.register(acceptor, token);
        });
    }

    private signAcceptance(acceptance: xnet.AcceptanceUnsigned): xnet.Acceptance {
        const data = Any.canonicalStringOf(acceptance);
        const acceptance0: any = acceptance;
        acceptance0.signature = {
            hashAlgorithm: HASH_ALGORITHM,
            digest: crypto.createSign(HASH_ALGORITHM)
                .update(data)
                .sign(this.model.me().primaryKeys().private)
                .toString("base64"),
        };
        return acceptance0 as xnet.Acceptance;
    }

    private signProposal(proposal: xnet.ProposalUnsigned): xnet.Proposal {
        const data = Any.canonicalStringOf(proposal);
        const proposal0: any = proposal;
        proposal0.signature = {
            hashAlgorithm: HASH_ALGORITHM,
            digest: crypto.createSign(HASH_ALGORITHM)
                .update(data)
                .sign(this.model.me().primaryKeys().private)
                .toString("base64"),
        };
        return proposal0 as xnet.Proposal;
    }

    private verifyProposal(proposal: xnet.Proposal): boolean {
        const proposer = this.model.users().getByKey(proposal.proposer);
        if (proposer === undefined) {
            return false;
        }
        const publicKey = this.model.users().getPublicKeyOf(proposer);
        if (publicKey === undefined) {
            return false;
        }
        const proposal0: any = Any.clone(proposal);
        delete proposal0.signature;
        const data = Any.canonicalStringOf(proposal0);
        return crypto.createVerify(HASH_ALGORITHM)
            .update(data)
            .verify(publicKey, Buffer.from(proposal.signature.digest, "base64"));
    }

    private verifyAcceptance(acceptance: xnet.Acceptance): boolean {
        if (!this.verifyProposal(acceptance.proposal)) {
            return false;
        }
        const acceptor = this.model.users().getByKey(acceptance.acceptor);
        if (acceptor === undefined) {
            return false;
        }
        const publicKey = this.model.users().getPublicKeyOf(acceptor);
        if (publicKey === undefined) {
            return false;
        }
        const acceptance0: any = Any.clone(acceptance);
        delete acceptance0.signature;
        const data = Any.canonicalStringOf(acceptance0);
        return crypto.createVerify(HASH_ALGORITHM)
            .update(data)
            .verify(publicKey, Buffer.from(acceptance.signature.digest, "base64"));
    }
}