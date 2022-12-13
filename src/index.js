const path = require("path");

const { app } = require("electron");
// 设置全局变量
Object.assign(global, {
  _IS_DEV_: require("electron-is-dev"),
  _IS_WIN_: process.platform === "win32",
  _IS_MAC_: process.platform === "darwin",
  _APP_PATH_: require("electron-is-dev") ? app.getAppPath() : path.join(app.getAppPath(), "dist"),
  _USER_DATA_: app.getPath("userData"),
  _TEMP_PATH_: app.getPath("temp"),
  _MAIN_ROOT_PATH_: "", // 主进程入口文件地址
  _RENDERER_ROOT_URL_: "", // 渲染进程入口文件地址
  _dbPath: "", // 数据库文件地址
});
// 替换console
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
