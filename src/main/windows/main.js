function create (props = {}) {
  const main = require('../managers/browser').create({
    width: 800,
    height: 800,
    name: 'main',
    show: true,
    ...props
  });
  main.loadURL(global._rendererView);
  main.webContents.openDevTools();
  return main;
}

module.exports = create;
