import {isTokenTemplate, isUser, TokenTemplate, User} from "../model";

/**
 * Application options.
 *
 * Note that this application is currently designed only to support some
 * particular kinds of demonstrations. Much of the information provided via a
 * file of this kind would be provided through other systems in a production
 * scenario.
 */
export interface Options {
    /**
     * Configuration for server that serves clients with a GUI.
     */
    server: {
        /// Port through which HTTP GUI is exposed.
        port: number;
    };

    /**
     * Configuration for server that serves other node applications.
     */
    peer: {
        /// Port through which other applications may reach this application.
        port: number;
    };

    /**
     * The identity used to represent the application instance.
     */
    me: {
        /// X.509 public key (PEM format).
        publicKey: string;

        /// X.509 private key (PEM format).
        privateKey: string;

        /// User profile.
        user: User,
    };

    /**
     * The profiles of all known node application instances, and the IP
     * addresses and ports through which they are available.
     *
     * These make up a naive version of the User Registry presented in the
     * paper "The Exchange Network: A General-Purpose Architecture for Digital
     * Negotiation and Exchange".
     */
    peers: {
        host: string;
        port: number;
        publicKey: string;
        user: User;
    }[];

    /**
     * Describes the tokens that can be created by this particular application
     * instance.
     *
     * These make up a naive version of the Definition Bank presented in the
     * paper "The Exchange Network: A General-Purpose Architecture for Digital
     * Negotiation and Exchange".
     */
    tokenTemplates: TokenTemplate[];
}

/**
 * Determines if given value is a set of `Options`.
 *
 * @param any Value to test.
 * @return Whether `any` contains a set of valid options.
 */
export function isOptions(any: any): any is Options {
    return typeof any === "object" && any !== null
        && typeof any.server === "object" && any.server !== null
        && typeof any.server.port === "number"
        && typeof any.peer === "object" && any.peer !== null
        && typeof any.peer.port === "number"
        && typeof any.me === "object" && any.me !== null
        && typeof any.me.publicKey === "string"
        && typeof any.me.privateKey === "string"
        && isUser(any.me.user)
        && Array.isArray(any.peers)
        && any.peers.findIndex((peer: any) => !(typeof peer === "object" && peer !== null
            && typeof peer.publicKey === "string"
            && typeof peer.port === "number")
            && isUser(peer.user)) === -1
        && Array.isArray(any.tokenTemplates)
        && any.tokenTemplates.findIndex((tokenTemplate: any) => {
            return !isTokenTemplate(tokenTemplate);
        }) === -1;
}
