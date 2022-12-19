const path = require('path');
class RendererUpdater {
  constructor (props) {
    this.env = {
      // 源文件
      source: props.source
    };
  }

  getInfo () {
    return {
      path: this.env.source,
      updated: true
    };
  }

  async getUrlProd (relativePath) {
    // 获取%appPath%/[appName]/updater/renderer/index.json
    //       是否获取成功 ---是---> 返回index.json中记录的路径信息
    //                  ---否---> 返回默认入口文件
    const root = 'file://' + path.join(this.env.source, './index.html');
    return root;
  }

  async getUrlDev (relativePath) {
    // const root = "http://localhost:8000";
    const root = 'file://' + path.join(this.env.source, './index.html');
    return root;
  }

  checkUpdate () {
    // 检查是否有新的更新
    // 修改相关index.json文件信息
  }
}

module.exports = RendererUpdater;
