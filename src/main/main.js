const { app } = require('electron');
const { getTray, run: setTray } = require('./managers/tray');
let mainWindowInstance = null;

(() => {
  process.on('uncaughtException', e => console.error('node未处理异常', e.stack));
  process.on('unhandledRejection', e => console.error('node未处理Promise错误', e));
  app.whenReady().then(() => {
    setTray();
    // 绑定ipc事件
    require('./managers/ipc').bindIpcEvent();
    mainWindowInstance = require('./windows').newWindow('main');
  });

  app.once('before-quit', () => {
    const tray = getTray();
    if (tray) tray.destroy();
  });

  app.on('second-instance', () => {
    if (mainWindowInstance) return mainWindowInstance.show();
    app.exit();
  });
})();
