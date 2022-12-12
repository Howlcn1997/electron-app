const path = require("path");
const isDev = require("electron-is-dev");
const appPath = require("electron").app.getAppPath();
global.__APP_PATH__ = isDev ? appPath : path.join(appPath, "dist");

const updaterRoot = path.join(global.__APP_PATH__, "./updater");
const appUpdaterPath = path.join(updaterRoot, "app.updater.js");
const mainUpdaterPath = path.join(updaterRoot, "main.updater.js");
const rendererUpdaterPath = path.join(updaterRoot, "renderer.updater.js");

// 启动electron-updater
const appUpdater = require(appUpdaterPath);
const mainUpdater = require(mainUpdaterPath);
const rendererUpdater = require(rendererUpdaterPath);
Object.assign(global.console, require("electron-log").functions);
(async () => {
  // 应用级别检查更新
  appUpdater.initUpdater();
  // 主进程资源
  global.__MAIN_ROOT_PATH__ = await mainUpdater.getResource();
  // 渲染进程资源
  global.__RENDERER_ROOT_URL__ = await rendererUpdater.getUrl();
  // 启动主进程
  require(global.__MAIN_ROOT_PATH__);
})();
