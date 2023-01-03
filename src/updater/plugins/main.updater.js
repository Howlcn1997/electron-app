const path = require('path');
const Updater = require('../utils/updater');

class MainUpdater extends Updater {
  constructor (props) {
    super(props);
    this.checkUpdate();
  }

  async getResourceProd (rootPath, relativePath) {
    // 获取%appPath%/[appName]/updater/main/index.json
    //       是否获取成功 ---是---> 返回index.json中记录的路径信息
    //                  ---否---> 返回默认入口文件
    const root = path.join(rootPath, './main/main.js');
    return root;
  }

  async getResourceDev (rootPath, relativePath) {
    const root = path.join(rootPath, './main/main.js');
    return root;
  }
}
module.exports = MainUpdater;
