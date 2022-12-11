import rimraf from "rimraf";
import path from "path";
import webpackPaths from "../configs/webpack.paths";
import deleteSourceMaps from "./delete-source-maps";

deleteSourceMaps();
rimraf.sync(path.join(webpackPaths.distMainPath, "*.LICENSE.txt"));
rimraf.sync(path.join(webpackPaths.distRendererPath, "*.LICENSE.txt"));
