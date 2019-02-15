import {Data} from "./Data";
import {ListArray} from "../../util";
import {User} from "../../model";

export class DataMe
    extends ListArray<User>
    implements Data<User>
{
    private readonly keys: WeakMap<User, {public: string, private: string}>;

    public readonly name: "me";

    public constructor() {
        super();
        this.keys = new WeakMap();
        this.name = "me";
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
     * Gets public/private keys of primary/default user.
     */
    public primaryKeys(): {public: string, private: string} {
        const user = this.primary();
        const pair = this.keys.get(this.primary());
        if (pair === undefined) {
            throw new Error("No private key exists for primary user");
        }
        return pair;
    }

    /**
     * Registers new user identity.
     *
     * @param publicKey Public key of user.
     * @param privateKey Private key of user.
     * @param user Actual user object.
     */
    public register(publicKey: string, privateKey: string, user: User) {
        this.push(user);
        this.keys.set(user, {public: publicKey, private: privateKey});
    }
}