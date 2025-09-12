const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        ...common.optimization,
        // Enable minification
        minimize: true,
        // Better tree shaking
        usedExports: true,
        sideEffects: false,
    },
    // Performance hints configuration
    performance: {
        hints: 'warning',
        maxEntrypointSize: 150000, // 150KB
        maxAssetSize: 150000, // 150KB
        assetFilter: function(assetFilename) {
            // Only check JS files
            return assetFilename.endsWith('.js');
        }
    }
});
