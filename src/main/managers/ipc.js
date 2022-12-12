const { ipcMain, app } = require("electron");
const manager = require("./browser");

/**
 *
 * @param {String} target 目标窗口name
 * @param {String} channel 消息类型
 * @param {*} message 消息主体
 */
function handleSendTo(e, { target, channel, message }) {
  const _targetInstance = manager.getInstance(target);
  if (!_targetInstance) return;
  _targetInstance.webContents.send(channel, message, e.sender.browserWindowOptions.name);
}

// 广播消息 （除发送方外的所有窗口）
function handleMessageBus(e, { channel, message }) {
  const _allWins = manager._wins;
  Object.keys(_allWins).forEach(
    (winName) => e.sender.browserWindowOptions.name !== winName && _allWins[winName].webContents.send(channel, message)
  );
}

function bindIpcEvent() {
  // 获取数据相关事件
  const responsiveListeners = {
    PING: () => new Promise().resolve("OK"),
    GET_WIN_NAMES: () => Object.keys(manager._wins),
  };

  // 窗口相关事件
  const browserListeners = {
    QUIT: () => app.quit(),
    DESTROY_WIN: (e, { name }) => manager.destroy(name),
    DESTROY_ALL_WIN: () => manager.destroyAll(),
    SEND_TO: handleSendTo,
    MESSAGE_BUS: handleMessageBus,
    /**
     * 基于WinsManager可以使得渲染进程使用其静态方法,亦可操作某个窗口实例
     * TODO: 由于灵活性过高,这里需要增加安全机制
     */
    WINDOW_MANAGER: (e, { name, action, args = [] }) => {
      if (name) {
        manager.getInstance(name)[action](...args);
      } else {
        manager[action](...args);
      }
    },
  };

  // 一般事件
  const commonListeners = {
    GET_GLOBAL_VARIABLE: (e, { key }) => global[key],
  };

  /**
   * Q: send / on  与  invoke / handle 的差别?
   * A: 1、send / on默认不会向发送方返回信息, 而invoke / handle会返回信息;
   *    2、send / on可以通过sendSync+event.returnValue进行双向通行,但其是同步的;
   *       send / on可以利用event.reply进行异步双向通信,但需要增加两个监听器,这是麻烦的,且难以管理.
   *    建议: 使用send / on进行单向通信, 使用invoke / handle进行双向通行.
   */

  for (const k in commonListeners) {
    ipcMain.handle("COMMON_IPC::" + k, commonListeners[k]);
  }
  for (const k in responsiveListeners) {
    ipcMain.handle("RESPONSIVE_IPC::" + k, responsiveListeners[k]);
  }
  for (const k in browserListeners) {
    ipcMain.on("BROWSER_IPC::" + k, browserListeners[k]);
  }
}

module.exports = { handleSendTo, handleMessageBus, bindIpcEvent };
