/**
 * Webpack config for production electron main process
 */

import path from "path";
import webpack from "webpack";
import { merge } from "webpack-merge";
import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import baseConfig from "./webpack.config.base";
import webpackPaths from "./webpack.paths";
import checkNodeEnv from "../scripts/check-node-env";
import deleteSourceMaps from "../scripts/delete-source-maps";
import ElectronBytenodePlugin from "../plugins/electron-bytenode-plugin";

checkNodeEnv("production");
deleteSourceMaps();

const configuration: webpack.Configuration = {
  devtool: "source-map",

  mode: "production",

  target: "node",

  entry: {
    ["updater"]: path.join(webpackPaths.srcUpdaterPath, "index.js"),
  },

  output: {
    path: webpackPaths.distUpdaterPath,
    filename: "[name].js",
    library: {
      type: "umd",
    },
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === "true" ? "server" : "disabled",
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),

    new ElectronBytenodePlugin(),
  ],
};

export default merge(baseConfig, configuration);
