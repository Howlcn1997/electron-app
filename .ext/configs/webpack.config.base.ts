/**
 * Base webpack config used across other specific configs
 */

import webpack from "webpack";
import webpackPaths from "./webpack.paths";
import CopyWebpackPlugin from "copy-webpack-plugin";

const configuration: webpack.Configuration = {
  stats: "errors-only",

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
            compilerOptions: {
              module: "esnext",
            },
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: "commonjs2",
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    modules: [webpackPaths.srcPath, "node_modules"],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: webpackPaths.srcAppEntryPath,
          to: webpackPaths.distAppEntryPath
        }
      ]
    })
  ],
};

export default configuration;