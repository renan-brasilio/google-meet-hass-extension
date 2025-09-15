const path = require("path");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    mode: "production",
    entry: {
        background: path.join(srcDir, 'background.ts'),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    // Disable code splitting for background script
    optimization: {
        splitChunks: false,
        runtimeChunk: false,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    // Target webworker for service worker
    target: "webworker",
};
