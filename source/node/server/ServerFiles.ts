import {Observable} from "../../util";
import {ServerFilesObserver} from "./ServerFilesObserver";
import * as fs from "fs";
import * as http from "http";
import * as _path from "path";
import * as url from "url";

/**
 * Routes file paths to files loaded from some folder.
 */
export class ServerFiles extends Observable<ServerFilesObserver> {
    private readonly assets: Map<string, Buffer>;

    /**
     * Creates web client for serving static files.
     *
     * @param path Path from which files are to be loaded.
     */
    public constructor(path: string) {
        super();

        this.assets = new Map();

        const readPath = (p: string) => {
            const stat = fs.statSync(p);
            if (stat.isDirectory()) {
                for (const name of fs.readdirSync(p)) {
                    readPath(_path.join(p, name));
                }
            }
            else if (stat.isFile()) {
                const name = "/" + _path.relative(path, p).replace("\\", "/");
                this.assets.set(name, fs.readFileSync(p));
            }
        };
        readPath(path);
    }

    /**
     * Attempts to find file matching path of `request`, or responds with 404
     * Not Found.
     *
     * @param request Request.
     * @param response Response.
     */
    public delegate(request: http.IncomingMessage, response: http.ServerResponse) {
        try {
            let path = url.parse(request.url || "").path || "/";
            if (path === "/") {
                const mime = (request.headers.accept || "/html").split(",")[0].split("/");
                const subtype = mime[1];
                if (mime.length === 2 && !subtype.startsWith("*")) {
                    path = "/index." + subtype.split("+")[0];
                }
            }
            const file = this.assets.get(path);
            if (file === undefined) {
                response.writeHead(404, "Not Found");
                response.end();
                return;
            }
            response.setHeader("Content-Type", pathToContentType(path));
            response.setHeader("Content-Length", file.length);
            response.end(file);
        }
        catch (error) {
            this.forEachSubscriber(s => s.onError(error));
        }

        function pathToContentType(path: string): string {
            switch (_path.extname(path).toLowerCase()) {
                case ".css":
                    return "text/css";
                case ".html":
                    return "text/html";
                case ".js":
                    return "application/javascript";
                case ".json":
                    return "application/json";
                case ".svg":
                    return "image/svg+xml";
                default:
                    return "application/octet-stream";
            }
        }
    }

    public async close(): Promise<void> {
        this.assets.clear();
    }
}