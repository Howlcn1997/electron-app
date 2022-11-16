
const { app } = require('electron');
// const Database = require('better-sqlite3');

(async () => {
  // 设置全局变量
  const globalVariable = require('./config/global-variable').variable.value;
  Object.assign(global, globalVariable);
  app.whenReady().then(async () => {
    // 绑定ipc事件
    require('./managers/ipc').bindIpcEvent();
    require('./windows').newWindow('main');
  });
})();
