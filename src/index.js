const path = require("path");
const { app } = require("electron");
// 设置全局变量
Object.assign(global, {
  _IS_DEV_: require("electron-is-dev"),
  _IS_WIN_: process.platform === "win32",
  _IS_MAC_: process.platform === "darwin",
  _APP_PATH_: app.getAppPath(),
  _USER_DATA_: app.getPath("userData"),
  _TEMP_PATH_: app.getPath("temp"),
  _MAIN_ROOT_PATH_: "", // 主进程入口文件地址
  _RENDERER_URL_: "", // 渲染进程入口文件地址
  _dbPath: "", // 数据库文件地址
});
Object.assign(global, {
  _RESOURCES_: path.join(global._APP_PATH_, "../resources"),
});

// 替换console
Object.assign(global.console, require("electron-log").functions);
const { getSourceMap } = require("./updater/index.js");

(async () => {
  const sourceDir = global._IS_DEV_ ? path.join(global._APP_PATH_, "../release/app") : global._APP_PATH_;
  const destDir = global._IS_DEV_
    ? path.join(global._APP_PATH_, "../updater")
    : path.join(global._USER_DATA_, "updater");

  const sourceMap = await getSourceMap({
    isDev: global._IS_DEV_,
    sourceDir,
    destDir,
    exclude: (fullPath) => {
      const basename = path.basename(fullPath);
      return basename === "__test__" || basename.startsWith(".");
    },
  });

  global._MAIN_ROOT_PATH_ = global._IS_DEV_ ? path.join(__dirname, "./main") : sourceMap["dist/main"];

  global._RENDERER_URL_ = global._IS_DEV_
    ? "http://localhost:8000"
    : "file://" + path.join(sourceMap["dist/renderer"], "index.html");
  // 启动主进程
  const nodeRequire = eval("require");
  const mainEntry = path.join(global._MAIN_ROOT_PATH_, "main.js");
  nodeRequire(mainEntry);

  console.info(`
  ==========================
  | [client start] => 
  | main_entry: ${mainEntry}
  | renderer_url: ${global._RENDERER_URL_}
  | node_modules_address: ${sourceMap["node_modules"]}
  ==========================`);
})();
