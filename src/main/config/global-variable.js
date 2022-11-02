const path = require('path');
const { app } = require('electron');

let _already = false;
function setGlobalVariable () {
  if (_already) return global;
  // 是否为测试环境
  global._IS_DEV_ = require('electron-is-dev');
  // 是否为windows
  global._IS_WIN_ = process.platform === 'win32';
  // 是否为MacOS
  global._IS_MAC_ = process.platform === 'darwin';
  // app所在路径
  global._APP_PATH_ = global._IS_DEV_
    ? app.getAppPath()
    : path.join(app.getAppPath(), 'app');
  // 用户数据路径
  global._USER_DATA_ = app.getPath('userData');
  // 临时文件路径
  global._TEMP_PATH_ = app.getPath('temp');
  // 应用路径
  global._APP_PATH_ = app.getAppPath();
  // 渲染进程ui路径
  global._rendererView = global._IS_DEV_
    ? 'http://localhost:8000/'
    : `file://${path.join(global._APP_PATH_, '/build/renderer/index.html')}`;
  // db文件存放路径
  global._dbPath = path.join(process.cwd(), '/resource/release/db');
  _already = true;
  return global;
}

const needSyncVariable = [
  '_IS_DEV_',
  '_IS_WIN_',
  '_IS_MAC_',
  '_APP_PATH_',
  '_USER_DATA_',
  '_TEMP_PATH_',
  '_APP_PATH_',
  '_rendererView',
  '_dbPath'
];

module.exports = {
  setGlobalVariable,
  needSyncVariable
};
