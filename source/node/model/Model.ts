import {Data} from "./Data";
import {DataExchanges} from "./DataExchanges";
import {DataLog} from "./DataLog";
import {DataMe} from "./DataMe";
import {DataUsers} from "./DataUsers";
import {DataProposals} from "./DataProposals";
import {DataTokens} from "./DataTokens";
import {DataTokenTemplates} from "./DataTokenTemplates";

export class Model {
    private readonly _exchanges: DataExchanges;
    private readonly _log: DataLog;
    private readonly _me: DataMe;
    private readonly _users: DataUsers;
    private readonly _proposals: DataProposals;
    private readonly _tokens: DataTokens;
    private readonly _tokenTemplates: DataTokenTemplates;

    public constructor() {
        this._exchanges = new DataExchanges();
        this._log = new DataLog();
        this._me = new DataMe();
        this._users = new DataUsers();
        this._proposals = new DataProposals();
        this._tokens = new DataTokens();
        this._tokenTemplates = new DataTokenTemplates();
    }

    public data(): Data<any>[] {
        return [
            this._exchanges,
            this._log,
            this._me,
            this._users,
            this._proposals,
            this._tokens,
            this._tokenTemplates,
        ];
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
}