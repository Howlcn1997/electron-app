const { app } = require('electron');
// const Database = require('better-sqlite3');

(async () => {
  // 设置全局变量
  require('./main/config/global-variable').setGlobalVariable();
  // 绑定ipc事件
  require('./main/managers/ipc').bindIpcEvent();
  app.whenReady().then(async () => {
    require('./main/main');
  });
})();
