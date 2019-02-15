const path = require("path");

module.exports = {
    mode: "development",
    entry: "./target/client/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "www/js")
    },
    node: {
        fs: "empty"
    }
};
