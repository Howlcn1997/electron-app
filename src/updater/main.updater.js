const path = require('path');
const isDev = require('electron-is-dev');

async function getResourceProd (relativePath) {
  // 获取%appPath%/[appName]/updater/main/index.json
  //       是否获取成功 ---是---> 返回index.json中记录的路径信息
  //                  ---否---> 返回默认入口文件
  const root = path.join(__dirname, '../main/main.js');
  return root;
}

async function getResourceDev (relativePath) {
  const root = path.join(__dirname, '../main/main.js');
  return root;
}

function checkUpdate () {
  // 检查是否有新的更新
  // 修改相关index.json文件信息
}

module.exports = {
  getResource: isDev ? getResourceDev : getResourceProd,
  checkUpdate
};
