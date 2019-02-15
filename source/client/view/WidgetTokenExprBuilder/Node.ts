import {Widget} from "../Widget";
import {xnet} from "../../../model";

export interface Node<T extends xnet.Expression = xnet.Expression> extends Widget {
    tokenize(): T;
}