const { app } = require('electron');

(async () => {
  app.whenReady().then(async () => {
    // 绑定ipc事件
    require('./managers/ipc').bindIpcEvent();
    require('./windows').newWindow('main');
  });
})();
