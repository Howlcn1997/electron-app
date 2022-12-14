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

const updaterPath = path.join(global._APP_PATH_, "./updater/index.js");
const updater = require(updaterPath);
// 启动electron-updater
(async () => {
  // 应用级别检查更新
  const { "dist/main": mainPath, "dist/renderer": rendererPath } = await updater.init({
    proxyRoot: global._APP_PATH_,
  });
  global._MAIN_ROOT_PATH_ = mainPath;
  global._RENDERER_ROOT_URL_ = rendererPath;
  // 启动主进程
  require(global._MAIN_ROOT_PATH_);
})();
