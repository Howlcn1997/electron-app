function create (props = {}) {
  const main = require('../managers/browser').create({
    width: 800,
    height: 800,
    name: 'main',
    show: true,
    loadURL: global._RENDERER_URL_,
    pluginOptions: { addDevTools: { prodValid: true } },
    webPreferences: {
      enableRemoteModule: true,
      devTools: true
    },
    ...props
  });
  main.webContents.openDevTools();
  return main;
}

module.exports = create;
