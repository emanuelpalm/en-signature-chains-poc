import {Data} from "./Data";
import {LogEntry} from "../../model";
import {ListArray} from "../../util";

export class DataLog
    extends ListArray<LogEntry>
    implements Data<LogEntry>
{
    public name: "log";

    public constructor() {
        super();
        this.name = "log";
    }

    public splice(start: number, deleteCount: number, ...items: LogEntry[]) {
        items.forEach(item => {
            if (item.data instanceof Error) {
                item.data = {
                    error: item.data.name,
                    message: item.data.message,
                    stack: item.data.stack,
                };
            }
        });
        super.splice(start, deleteCount, ...items);
    }
}