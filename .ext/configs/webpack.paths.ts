const path = require("path");

const rootPath = path.join(__dirname, "../..");

const dllPath = path.join(__dirname, "../dll");

const srcPath = path.join(rootPath, "src");
const srcAppEntryPath = path.join(srcPath, "index.js");
const srcMainPath = path.join(srcPath, "main");
const srcRendererPath = path.join(srcPath, "renderer");
const srcUpdaterPath = path.join(srcPath, "updater");

const releasePath = path.join(rootPath, "release");
const appPath = path.join(releasePath, "app");
const appPackagePath = path.join(appPath, "package.json");
const appNodeModulesPath = path.join(appPath, "node_modules");
const srcNodeModulesPath = path.join(srcPath, "node_modules");

const distPath = path.join(appPath, "dist");
const distAppEntryPath = path.join(distPath, "index.js");
const distMainPath = path.join(distPath, "main");
const distRendererPath = path.join(distPath, "renderer");
const distUpdaterPath = path.join(distPath, "updater");

const buildPath = path.join(releasePath, "build");

export default {
  rootPath,
  dllPath,
  srcPath,
  srcAppEntryPath,
  srcMainPath,
  srcRendererPath,
  srcUpdaterPath,
  releasePath,
  appPath,
  appPackagePath,
  appNodeModulesPath,
  srcNodeModulesPath,
  distPath,
  distAppEntryPath,
  distMainPath,
  distRendererPath,
  distUpdaterPath,
  buildPath,
};
