import {Model} from "../model";
import {Peer} from "../Peer";

export interface ServerConfiguration {
    filesPath: string,
    model: Model,
    peer: Peer,
    tls?: {
        certificate: Buffer,
        privateKey: Buffer,
    };
}