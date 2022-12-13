const { app } = require("electron");
// const Database = require('better-sqlite3');

(async () => {
  app.whenReady().then(async () => {
    // 绑定ipc事件
    require("./managers/ipc").bindIpcEvent();
    require("./windows").newWindow("main");
  });
})();
