const path = require("path");
const { ProvidePlugin } = require("webpack");

module.exports = {
  transpileDependencies: true,
  devServer: {
    port: 3000
  },
  configureWebpack: (config) => {
    config.resolve.fallback = {
      // crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      crypto: require.resolve("crypto-browserify"),
    };
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    config.plugins.push(new ProvidePlugin({ Buffer: ["buffer", "Buffer"] }));
    config.plugins.push(new ProvidePlugin({ process: ["process/browser"] }));
  },
};
