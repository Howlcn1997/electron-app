
// const { contextBridge, ipcRenderer } = require('electron');
process.once('loaded', () => {
  // contextBridge.exposeInMainWorld('electron', {
  //   getGlobalVariable: (key) => ipcRenderer.invoke('COMMON_IPC::GET_GLOBAL_VARIABLE', { key }),
  //   sendToTarget: (target, channel, message) => {
  //     ipcRenderer.send('BROWSER_IPC::SEND_TO', { target, channel, message });
  //   },
  //   listenFrom: (target, channel, cb) => {
  //     ipcRenderer.on(channel, (e, message, from) => {
  //       target === from && cb(message);
  //     });
  //   }
  // });

  if (global.require) {
    // 这里将require替换为nodeRequire,是为了避免渲染进程使用webpack打包时将CommonJS的require直接静态编译为__webpack_require__
    global.nodeRequire = global.require;
    delete global.require;
    delete global.exports;
    delete global.module;
  }
});
