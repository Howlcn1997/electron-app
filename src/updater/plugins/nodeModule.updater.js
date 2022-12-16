class NodeModuleUpdater {
  constructor(props) {
    this.env = {
      // 源文件
      source: props.source,
    };
  }
  getInfo() {
    return this.env.source;
  }
}

module.exports = NodeModuleUpdater;
