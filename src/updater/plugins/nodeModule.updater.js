class NodeModuleUpdater {
  constructor (props) {
    this.env = {
      // 源文件
      source: props.source
    };
  }

  getInfo () {
    return {
      path: this.env.source,
      updated: false
    };
  }
}

module.exports = NodeModuleUpdater;
