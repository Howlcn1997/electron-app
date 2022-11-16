process.once('loaded', () => {
  const globalVariable = require('./config/global-variable').variable.value;

  console.log('equire()', require('electron'));
  // 同步全局变量
  // const { getGlobal } = require('electron').remote;
  // globalVariable.forEach(key => {
  //   global[key] = getGlobal(key);
  // });

  // 封装ipcRenderer.send("SEND_TO")
  const _ipcRenderer = require('electron').ipcRenderer;
  /**
   *
   * @param {String} target 目标窗口名 【如main, main::window1】
   * @param {String} channel 事件名
   * @param {*<NOT FUNCTION>} message 消息主体
   */
  _ipcRenderer.sendToTarget = function (target, channel, message) {
    _ipcRenderer.send('BROWSER_IPC::SEND_TO', { target, channel, message });
  };

  _ipcRenderer.listenFrom = function (target, channel, cb) {
    _ipcRenderer.on(channel, (e, message, from) => {
      target === from && cb(message);
    });
  };
  if (global.require) {
    // 这里将require替换为nodeRequire,是为了避免渲染进程使用webpack打包时将CommonJS的require直接静态编译为__webpack_require__
    global.nodeRequire = global.require;
    delete global.require;
    delete global.exports;
    delete global.module;
  }
});
