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
import ElectronBytenodePlugin from "../plugins/electron-bytenode-plugin";

checkNodeEnv("production");

const configuration: webpack.Configuration = {
  devtool: "source-map",

  mode: "production",

  target: "electron-main",

  entry: {
    index: webpackPaths.srcAppEntryPath,
  },

  output: {
    path: path.join(webpackPaths.distAppEntryPath, "../"),
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

    new webpack.DefinePlugin({
      "process.type": '"main"',
    }),

    // new ElectronBytenodePlugin(),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
