const path = require("path");

async function getUrlProd(rootPath, relativePath) {
  // 获取%appPath%/[appName]/updater/renderer/index.json
  //       是否获取成功 ---是---> 返回index.json中记录的路径信息
  //                  ---否---> 返回默认入口文件
  const root = "file://" + path.join(rootPath, "./renderer/index.html");
  return root;
}

async function getUrlDev(rootPath, relativePath) {
  // const root = "http://localhost:8000";
  const root = "file://" + path.join(rootPath, "../release/app/dist/renderer/index.html");
  return root;
}

function checkUpdate() {
  // 检查是否有新的更新
  // 修改相关index.json文件信息
}

module.exports = {
  getUrl: process.env.NODE_ENV === "production" ? getUrlProd : getUrlDev,
  checkUpdate,
};
