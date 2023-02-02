/**
 * Base webpack config used across other specific configs
 */

import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import webpackPaths from "./webpack.paths";
import ElectronBytenodePlugin from "../plugins/electron-bytenode-plugin";

const configuration: webpack.Configuration = {
  stats: "errors-only",

  output: {
    path: webpackPaths.srcPath,
    library: {
      type: "commonjs2",
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    modules: ["node_modules"],
  },
  externals: [nodeExternals()],
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      NODE_PLATFORM: process.platform,
    }),
    new ElectronBytenodePlugin(),
  ],
};

export default configuration;
