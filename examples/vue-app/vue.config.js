const path = require("path");
const { ProvidePlugin } = require("webpack");

module.exports = {
  transpileDependencies: true,
  devServer: {
    port: 3000,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  configureWebpack: (config) => {
    config.resolve.fallback = {
      // crypto: require.resolve("crypto-browserify"),
      //stream: require.resolve("stream-browserify"),
      //assert: require.resolve("assert"),
      //crypto: require.resolve("crypto-browserify"),
      crypto: false,
      stream: false,
      assert: false,
      os: false,
      https: false,
      http: false,
      zlib: false,
    };
    /* config.resolve.alias = {
      ...config.resolve.alias,
    }; */
    config.resolve.alias = {
      ...config.resolve.alias,
      "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
      lodash: path.resolve(__dirname, "node_modules/lodash"),
    };
    config.plugins.push(new ProvidePlugin({ Buffer: ["buffer", "Buffer"] }));
    config.plugins.push(new ProvidePlugin({ process: ["process/browser"] }));
  },
};
