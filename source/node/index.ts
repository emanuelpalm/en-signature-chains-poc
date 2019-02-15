import * as fs from "fs";
import {isOptions} from "./Options";
import {Model} from "./model";
import {Peer} from "./Peer";
import {Server} from "./server";
import * as process from "process";

/**
 * Application main class.
 */
class Application {
    private readonly model: Model;
    private readonly peerPort: number;
    private readonly peer: Peer;
    private readonly server: Server;
    private readonly serverPort: number;

    /**
     * Creates new application.
     *
     * @param argv Application command line arguments.
     */
    constructor(argv = process.argv.slice(2)) {
        if (argv.length !== 1) {
            throw "Usage: npm start <path-to-configuration.json>";
        }
        const options = JSON.parse(fs.readFileSync(argv[0]).toString("utf8"));
        if (!isOptions(options)) {
            throw "Invalid options file: " + argv[0];
        }

        this.model = new Model();

        // Setup node server, used to communicate with other node applications.
        {
            this.peerPort = options.peer.port;
            this.peer = new Peer(this.model);
        }

        // Setup client server, used by client users to control the application.
        {
            this.serverPort = options.server.port;
            this.server = new Server({
                filesPath: "./www",
                model: this.model,
                peer: this.peer,
            });
        }

        // Setup application identity.
        {
            this.model.me().register(
                options.me.publicKey,
                options.me.privateKey,
                options.me.user);
            this.model.users().register(options.me.publicKey, options.me.user);
        }

        // Setup application peers.
        {
            const users = this.model.users();
            for (const peer0 of options.peers) {
                users.register(peer0.publicKey, peer0.user, peer0.host, peer0.port);
            }
        }

        // Setup token templates.
        {
            const tokenTemplates = this.model.tokenTemplates();
            for (const tokenTemplate of options.tokenTemplates) {
                tokenTemplates.push(tokenTemplate);
            }
        }
    }

    /**
     * Application start routine.
     */
    public async start() {
        await this.server.listen(this.serverPort);
        await this.peer.listen(this.peerPort);

        console.info(`Listening on ports ${this.serverPort} (clients)` +
            ` and ${this.peerPort} (peers) ...`);
    }

    /**
     * Application exit routine.
     */
    public async exit() {
        console.info("Exiting ...");
        await this.server.close();
        await this.peer.close();

        console.info("Exited.");
    }
}

// Bootstrap.
try {
    const application = new Application();

    let didExit = false;
    const onExit = () => {
        if (didExit) {
            return;
        }
        didExit = true;
        application.exit()
            .then(() => process.exit(0))
            .catch(error => {
                console.error("Orderly exit failed!\nReason:\n%o", error);
                process.exit(2);
            });
    };

    process.on("SIGINT", () => {
        console.log();
        onExit();
    });
    process.on("SIGTERM", onExit);
    process.on("SIGHUP", onExit);

    application.start()
        .catch(error => {
            console.error("System start failed!\nReason:\n%o", error);
            process.exit(1);
        });
}
catch (error) {
    console.error(error);
    process.exit(3);
}