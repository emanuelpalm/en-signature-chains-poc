import {Data} from "./Data";
import {TokenTemplate} from "../../model";
import {ListArray} from "../../util";

export class DataTokenTemplates
    extends ListArray<TokenTemplate>
    implements Data<TokenTemplate>
{
    public name: "tokenTemplates";

    public constructor() {
        super();
        this.name = "tokenTemplates";
    }
}