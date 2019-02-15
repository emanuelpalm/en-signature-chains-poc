import {Data} from "./Data";
import {User, xnet} from "../../model";
import {ListArray} from "../../util";

export class DataTokens
    extends ListArray<[User, xnet.Token]>
    implements Data<[User, xnet.Token]>
{
    public name: "tokens";

    private tokenIdToIndex: Map<string, number> = new Map();

    public constructor() {
        super();
        this.name = "tokens";
    }

    public register(owner: User, token: xnet.Token) {
        if (token.id === undefined) {
            throw new Error("Unqualified tokens cannot be owned. "
                + JSON.stringify(token));
        }
        const index = this.tokenIdToIndex.get(token.id);
        if (index !== undefined) {
            this.splice(index, 1, [owner, token]);
        }
        else {
            this.push([owner, token]);
        }
    }
}