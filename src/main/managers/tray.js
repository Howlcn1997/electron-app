// 托盘状态管理
const { Tray, nativeImage, Menu } = require('electron');
const path = require('path');
let __tray = null;

function getTray () {
  return __tray;
}

function run () {
  const iconResource = path.join(
    global._RESOURCES_,
    'icons',
    global._IS_MAC_ ? 'icon_mini_white_256.png' : 'icon_mini_gradient_256.png'
  );
  __tray = new Tray(
    nativeImage.createFromPath(iconResource).resize({ width: 16, height: 16 })
  );

  const contextMenu = Menu.buildFromTemplate([
    { label: '首选项' },
    { label: '检查更新' },
    { label: '退出', click: () => { require('electron').app.exit(); } }
  ]);
  __tray.setContextMenu(contextMenu);
}

module.exports = { run, getTray };
