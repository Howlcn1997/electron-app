const path = require("path");
const isDev = require("electron-is-dev");
const appPath = require("electron").app.getAppPath();

async function getUrlProd(relativePath) {
  // 获取%appPath%/[appName]/updater/renderer/index.json
  //       是否获取成功 ---是---> 返回index.json中记录的路径信息
  //                  ---否---> 返回默认入口文件
  const root = "file://" + path.join(appPath, "./dist/renderer/index.html");
  return root;
}

async function getUrlDev(relativePath) {
  // const root = "http://localhost:8000";
  const root = "file://" + path.join(appPath, "../release/dist/renderer/index.html");
  return root;
}

function checkUpdate() {
  // 检查是否有新的更新
  // 修改相关index.json文件信息
}

module.exports = {
  getUrl: isDev ? getUrlDev : getUrlProd,
  checkUpdate,
};
