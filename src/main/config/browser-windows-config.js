const path = require("path");
const preloadScript = path.join(global._APP_PATH_, "./preload.js");
// 公共配置

const commonConfig = {
  backgroundColor: "#fff",
  resizable: true,
  //   minimizable: true,
  //   maximizable: false,
  //   fullscreenable: false,
  alwaysOnTop: false,
  frame: false,
  transparent: false,
  show: false,
  hasShadow: true,
  autoHideMenuBar: true,
  titleBarStyle: "hiddenInset",
  acceptFirstMouse: true,
  webPreferences: {
    nodeIntegrationInWorker: true,
    enableRemoteModule: true,
    contextIsolation: false,
    nodeIntegration: true,
    enableWebSQL: false,
    webSecurity: false,
    spellcheck: false,
    webgl: true,
    preload: preloadScript,
  },
};

// 开发环境配置
const devConfig = {
  ...commonConfig,
  webPreferences: {
    ...commonConfig.webPreferences,
    devTools: true,
  },
};

// 生产环境配置
const prodConfig = {
  ...commonConfig,
  webPreferences: {
    ...commonConfig.webPreferences,
    devTools: false,
  },
};

module.exports = { commonConfig, devConfig, prodConfig };
