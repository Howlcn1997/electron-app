const path = require("path");
const isDev = require("electron-is-dev");
const appPath = require("electron").app.getAppPath();
global._APP_PATH_ = isDev ? appPath : path.join(appPath, "dist");
Object.assign(global.console, require("electron-log").functions);

const updaterRoot = path.join(global._APP_PATH_, "./updater");
const appUpdaterPath = path.join(updaterRoot, "app.updater.js");
const mainUpdaterPath = path.join(updaterRoot, "main.updater.js");
const rendererUpdaterPath = path.join(updaterRoot, "renderer.updater.js");

// 启动electron-updater
const appUpdater = require(appUpdaterPath);
const mainUpdater = require(mainUpdaterPath);
const rendererUpdater = require(rendererUpdaterPath);
(async () => {
  // 应用级别检查更新
  appUpdater.initUpdater();
  // 主进程资源
  global._MAIN_ROOT_PATH_ = await mainUpdater.getResource(global._APP_PATH_);
  // 渲染进程资源
  global._RENDERER_ROOT_URL_ = await rendererUpdater.getUrl(global._APP_PATH_);
  // 启动主进程
  require(global._MAIN_ROOT_PATH_);
})();
