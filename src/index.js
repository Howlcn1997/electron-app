const path = require('path');

const { app } = require('electron');
// 设置全局变量
Object.assign(global, {
  _IS_DEV_: require('electron-is-dev'),
  _IS_WIN_: process.platform === 'win32',
  _IS_MAC_: process.platform === 'darwin',
  _APP_PATH_: app.getAppPath(),
  _USER_DATA_: app.getPath('userData'),
  _TEMP_PATH_: app.getPath('temp'),
  _MAIN_ROOT_PATH_: '', // 主进程入口文件地址
  _RENDERER_ROOT_URL_: '', // 渲染进程入口文件地址
  _dbPath: '' // 数据库文件地址
});
// 替换console
Object.assign(global.console, require('electron-log').functions);

const { getSourceMap } = require(path.join(global._APP_PATH_, './updater/index'));

(async () => {
  const sourceDir = path.join(global._APP_PATH_);
  const destDir = path.join(global._USER_DATA_, 'updater');

  if (global._IS_DEV_) {
    global._MAIN_ROOT_PATH_ = path.join(sourceDir, 'main');
    global._RENDERER_URL_ = 'http://localhost:8000';
  } else {
    const sourceMap = await getSourceMap({
      sourceDir,
      destDir,
      exclude: (fullPath) => {
        const basename = path.basename(fullPath);
        return basename === '__test__' || basename.startsWith('.');
      }
    });
    global._MAIN_ROOT_PATH_ = sourceMap['dist/main'];
    global._RENDERER_URL_ = sourceMap['dist/renderer'];
  }
  // 启动主进程
  require(path.join(global._MAIN_ROOT_PATH_, 'main.js'));
})();
