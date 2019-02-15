import {Data} from "./Data";
import {DataExchanges} from "./DataExchanges";
import {DataLog} from "./DataLog";
import {DataMe} from "./DataMe";
import {DataUsers} from "./DataUsers";
import {DataProposals} from "./DataProposals";
import {DataTokens} from "./DataTokens";
import {DataTokenTemplates} from "./DataTokenTemplates";
import {Error} from "../../rpc-json";
import {Negotiator} from "./Negotiator";
import {ModelObserver} from "./ModelObserver";
import {Observable} from "../../util";
import {SocketRPC} from "../util";

/**
 * Represents a connection to some Exchange Network Model.
 */
export class Model extends Observable<ModelObserver> {
    private readonly _data: Map<string, Data>;
    private readonly _socket: SocketRPC;
    private readonly _exchanges: DataExchanges;
    private readonly _log: DataLog;
    private readonly _me: DataMe;
    private readonly _negotiator: Negotiator;
    private readonly _users: DataUsers;
    private readonly _proposals: DataProposals;
    private readonly _tokens: DataTokens;
    private readonly _tokenTemplates: DataTokenTemplates;

    public constructor(hostname: string, port: number) {
        super();
        this._socket = new SocketRPC(`ws://${hostname}:${port}`);
        this._exchanges = new DataExchanges(this._socket);
        this._log = new DataLog(this._socket);
        this._me = new DataMe(this._socket);
        this._negotiator = new Negotiator(this._socket);
        this._users = new DataUsers(this._socket);
        this._proposals = new DataProposals(this._socket);
        this._tokens = new DataTokens(this._socket);
        this._tokenTemplates = new DataTokenTemplates(this._socket);
        this._data = new Map<string, Data>([
            [this._exchanges.name, this._exchanges],
            [this._log.name, this._log],
            [this._me.name, this._me],
            [this._users.name, this._users],
            [this._proposals.name, this._proposals],
            [this._tokens.name, this._tokens],
            [this._tokenTemplates.name, this._tokenTemplates],
        ]);

        this._socket.subscribe({
            onClose: error => {
                this.forEachSubscriber(s => s.onDisconnected(error));
            },
            onError: error => {
                this._log.splice(0, 0, {
                    title: "JSON-RPC 2.0 Socket Error",
                    data: error,
                });
            },
            onOpen: () => {
                this.forEachSubscriber(s => s.onConnected());
            },
        });
        this._socket.setCallback(async (name, ...args): Promise<any> => {
            const [data, operation] = name.split(".", 2);
            const data0 = this._data.get(data);
            if (data0 === undefined) {
                return Error.METHOD_NOT_FOUND;
            }
            switch (operation) {
            case "splice":
                if (args.length < 2) {
                    return Error.INVALID_PARAMS;
                }
                return data0.splice(args[0], args[1], ...args.slice(2));

            default:
                return Error.METHOD_NOT_FOUND;
            }
        });
    }

    public data(): IterableIterator<Data> {
        return this._data.values();
    }

    public exchanges(): DataExchanges {
        return this._exchanges;
    }

    public log(): DataLog {
        return this._log;
    }

    public me(): DataMe {
        return this._me;
    }

    public negotiator(): Negotiator {
        return this._negotiator;
    }

    public users(): DataUsers {
        return this._users;
    }

    public proposals(): DataProposals {
        return this._proposals;
    }

    public tokens(): DataTokens {
        return this._tokens;
    }

    public tokenTemplates(): DataTokenTemplates {
        return this._tokenTemplates;
    }

    /**
     * Refreshes all model data by requesting them again from their sources.
     *
     * @return Promise of operation resolution or rejection.
     */
    public refresh(): Promise<void> {
        const refreshes = [];
        for (const data of this.data()) {
            refreshes.push(data.refresh());
        }
        return Promise.all(refreshes)
            .then(() => {});
    }
}