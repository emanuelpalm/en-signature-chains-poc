import * as rpc from "../../rpc-json";
import * as http from "http";
import * as https from "https";
import {ServerFiles} from "./ServerFiles";
import {ServerRPC} from "./ServerRPC";
import {ServerConfiguration} from "./ServerConfiguration";
import {Proposal, xnet} from "../../model";

export * from "./ServerConfiguration";

export class Server {
    private readonly routerRPC: rpc.Router;
    private readonly server: http.Server | https.Server;
    private readonly serverFiles: ServerFiles;
    private readonly serverRPC: ServerRPC;

    public constructor(cfg: ServerConfiguration) {
        this.routerRPC = new rpc.Router();
        this.server = cfg.tls
            ? https.createServer({cert: cfg.tls.certificate, key: cfg.tls.privateKey})
            : http.createServer();
        this.serverFiles = new ServerFiles(cfg.filesPath);
        this.serverRPC = new ServerRPC();

        this.server.on("request", (request, response) => {
            this.serverFiles.delegate(request, response);
        });
        this.server.on("upgrade", (request, socket, head) => {
            this.serverRPC.delegate(request, socket, head);
        });

        this.serverFiles.subscribe({
            onError: error => cfg.model.log().push({
                title: "File Server Error",
                data: error,
            }),
        });
        this.serverRPC.subscribe({
            onClose: () => {},
            onError: error => {
                console.error(error);
                cfg.model.log().push({
                    title: "RPC Error",
                    data: error,
                });
            },
            onSocket: () => {},
        });
        this.routerRPC.source(this.serverRPC);
        for (const data of cfg.model.data()) {
            data.subscribe({
                onSplice: (start: number, deleteCount: number, ...items) => {
                    this.routerRPC.notifyAll(`${data.name}.splice`, start,
                        deleteCount, ...items);
                },
            });
            this.routerRPC.method(`${data.name}.slice`, (start, end) => {
                if (start === null) {
                    start = undefined;
                }
                if (end === null) {
                    end = undefined;
                }
                return {
                    length: data.length(),
                    slice: data.slice(start, end),
                };
            });
            this.routerRPC.method(`${data.name}.splice`, (start, deleteCount, ...items) => {
                return data.splice(start, deleteCount, ...items);
            });
        }
        this.routerRPC.method("negotiator.accept", async (proposal: Proposal) => {
            cfg.peer.accept(proposal);
        });
        this.routerRPC.method("negotiator.discard", (proposal: Proposal) => {
            cfg.peer.discard(proposal);
        });
        this.routerRPC.method("negotiator.propose", async (proposal: Proposal) =>  {
            cfg.peer.propose(proposal);
        });
    }

    public close(): Promise<void> {
        return new Promise(resolve => {
            this.serverFiles.close()
                .then(() => this.serverRPC.close())
                .then(() => this.server.close(() => resolve()));
        });
    }

    public listen(port?: number) {
        this.server.listen(port);
    }
}