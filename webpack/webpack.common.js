const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
        background: path.join(srcDir, 'background.ts'),
        options: path.join(srcDir, 'options.tsx'),
        popup: path.join(srcDir, 'popup.tsx'),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 20000,
            maxSize: 200000,
            cacheGroups: {
                // Separate Material-UI components into smaller chunks
                muiCore: {
                    test: /[\\/]node_modules[\\/]@mui[\\/]material[\\/]/,
                    name: 'mui-core',
                    chunks: 'all',
                    priority: 30,
                    enforce: true,
                },
                muiIcons: {
                    test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/]/,
                    name: 'mui-icons',
                    chunks: 'all',
                    priority: 25,
                    enforce: true,
                },
                muiLab: {
                    test: /[\\/]node_modules[\\/]@mui[\\/]lab[\\/]/,
                    name: 'mui-lab',
                    chunks: 'all',
                    priority: 20,
                    enforce: true,
                },
                // Separate React libraries
                react: {
                    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    name: 'react',
                    chunks: 'all',
                    priority: 35,
                    enforce: true,
                },
                // Separate emotion (MUI styling)
                emotion: {
                    test: /[\\/]node_modules[\\/]@emotion[\\/]/,
                    name: 'emotion',
                    chunks: 'all',
                    priority: 15,
                    enforce: true,
                },
                // Other vendor libraries
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                    priority: 10,
                    enforce: true,
                },
                // Common chunks for shared code
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    priority: 5,
                    reuseExistingChunk: true,
                },
            },
        },
        // Enable runtime chunk for better caching
        runtimeChunk: {
            name: 'runtime',
        },
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
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
            options: {},
        }),
    ],
};
