import {Data} from "./Data";
import {User, xnet} from "../../model";
import {ListArray} from "../../util";

export class DataUsers extends ListArray<User> implements Data<User> {
    private readonly data: WeakMap<User, { public: string, host: string, port: number }>;

    public name: "users";

    public constructor() {
        super();
        this.name = "users";
        this.data = new WeakMap();
    }

    public getByKey(key: xnet.ID): User | undefined {
        for (const user of this.items()) {
            if (user.key === key) {
                return user;
            }
        }
        return undefined;
    }

    public getHostAndPortOf(user: User): [string, number] | undefined {
        const data = this.data.get(user);
        return data !== undefined
            ? [data.host, data.port]
            : undefined;
    }

    public getPublicKeyOf(user: User): string | undefined {
        const data = this.data.get(user);
        return data !== undefined
            ? data.public
            : undefined;
    }

    public register(publicKey: string, user: User, host = "localhost", port = -1) {
        this.push(user);
        this.data.set(user, {public: publicKey, host, port});
    }
}