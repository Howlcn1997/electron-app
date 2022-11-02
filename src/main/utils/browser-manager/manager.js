const { BrowserWindow } = require('electron');
const assert = require('assert').ok;
const { update } = require('lodash');
const { setBoundsByPosition, isFatherSonRelationship } = require('./utils');

const IS_DEV = require('electron-is-dev');
const IS_WIN = process.platform === 'win32';
const IS_MAC = !IS_WIN;
/**
 * 备忘：为什么manager要基于用户自定的name构建，而不直接使用new BrowserWindow生成的唯一id？
 *
 * 原因：1、已被创建但已经隐藏时，用户再去创建同一个窗口时不必重复创建，而直接显示该窗口，用户不必再创建窗口前检查该窗口是否已经存在；
 *      2、因为new BrowserWindow创建的每个窗口id是唯一的，很难去判断窗口的重复性；
 *      3、使用用户自定的name，可以将“显示已创建窗口”和“创建新窗口”的动作用一个api完成，用户时完全可控的。
 *
 */

/**
 * TODO_LIST:
 *  1、新建窗口超出屏幕时，重新设置父亲窗口与新建窗口位置
 */

function WinsManager (props) {
  this._wins = {};
  /**
   * _eventFunctions [data structure]
   *
   * Object<[winName]:Object<[eventName]:Array<function>>>
   * {
   *    [winName]: {
   *                   [eventName]: [fn,fn,fn]
   *               }
   * }
   */
  this._eventFunctions = {};
  this._winsRelationMap = {};
  this.browserConfig = props.defaultConfig || {};
  /**
   * _winsRelationMap = {[winName]: `${parentFullName}::winName`} 例如 {fixed_wins : main::fixed_wins}
   */
}

/**
 * 创建窗口
 * @param {Object} config 窗口配置
 * @param {Object} position 定位配置(相对于创建者窗口的定位)
 *
 * @returns undefined: 重复创建或创建失败
 *          <BrowserWindow>: 所创建的窗口实例
 */
WinsManager.prototype.create = function (config = {}, position = null) {
  assert(config.name, 'You must set [name] in config when using WinsManager.prototype.create');

  // if (config.parentName) {
  //   config.name = `${config.parentName}::${config.name}`;
  // }

  if (this.getInstance(config.name)) {
    this.getInstance(config.name).show();
    return;
  }

  if (config.parentName && !config.parent) {
    config.parent = this.getInstance(config.parentName);
  }
  // start safe mode [Enable when opening a third-party webpage]
  if (config.secure) {
    // TODO: Perfect the configuration
    this.browserConfig.webPreferences.contextIsolation = true;
  }

  const _newWin = new BrowserWindow({ ...this.browserConfig, show: false, ...config });

  config.loadURL && _newWin.loadURL(config.loadURL);
  config.loadFile && _newWin.loadFile(config.loadFile);

  // 防止白屏
  if (config.show) {
    _newWin.on('ready-to-show', () => {
      _newWin.show();
    });
  }

  this.register(_newWin, config, position);
  return _newWin;
};

/**
 * 打开窗口
 * @param {Object} config 窗口配置
 * @param {Object} position 定位配置(相对于创建者窗口的定位)
 *
 * @desc 刷新已建窗口信息
 */
WinsManager.prototype.refresh = function (config = {}, position = null) {
  const winInstance = this.getInstance(config.name);
  if (!winInstance) {
    return;
  }
  config.loadURL && winInstance.loadURL(config.loadURL);
  config.loadFile && winInstance.loadFile(config.loadFile);
  // 刷新定位信息
  if (position && this.getInstance(config.parentName)) {
    this.setPosition(config, position);
  }
  winInstance.show();
};

/**
 * 注册窗口实例
 * @param {BrowserWindow} winInstance
 * @param {String} winName 窗口名称
 *
 */
WinsManager.prototype.register = function (winInstance, config, position) {
  winInstance.name = config.name;
  winInstance.parentName = config.parentName || '';
  // 取代原生setBounds
  winInstance.__setBounds = winInstance.setBounds;
  winInstance.setBounds = bounds => this.setCustomBounds(config.name, bounds);

  this._wins[winInstance.name] = winInstance;

  const parentFullName = this._winsRelationMap[winInstance.parentName];
  this._winsRelationMap[winInstance.name] = (parentFullName ? `${parentFullName}::` : '') + winInstance.name;

  winInstance.on('closed', () => {
    this.deregister(winInstance.name);
  });
  // 添加定位功能
  if (position && winInstance.parentName) {
    if (this.getInstance(winInstance.parentName)) {
      this.setPosition(config, position);
    }
  }

  // 添加开发者工具
  this.addDevTools(winInstance.name, config?.pluginOptions?.addDevTools);
};

// 注销窗口实例
WinsManager.prototype.deregister = function (winName) {
  if (!this._wins[winName]) return; // 关闭子级窗口
  // 注销父窗口上的相关事件
  const _parentName = this.getParentWinName(this._winsRelationMap[winName]);
  if (_parentName) {
    this.__cancelEventFunction(_parentName, undefined, winName);
  }
  for (const name in this._wins) {
    const fullName = this._winsRelationMap[name];
    if (isFatherSonRelationship(winName, fullName) && this._wins[name]) {
      this._wins[name].close();
    }
  }
  delete this._winsRelationMap[winName];
  delete this._wins[winName];
};

WinsManager.prototype.setPosition = function (config, position) {
  const winInstance = this.getInstance(config.name);
  // 为需要跟随定位的子窗口增加自定义获取bounds的方法，以修复electron getBounds的bug
  // issue: https://github.com/electron/electron/issues/29605
  this.freshExtraInfo(config.name);
  this.__cancelEventFunction(config.parentName, 'resized', config.name);
  this.__cancelEventFunction(config.parentName, 'move', config.name);
  if (position.immediate) {
    setBoundsByPosition(position, this.getInstance(config.parentName), winInstance);
  }
  this.__registerEventFunction(
    config.parentName,
    'resized',
    e => {
      setBoundsByPosition(position, e.sender, winInstance);
    },
    config.name
  );
  if (!(IS_MAC && config.parent)) {
    this.__registerEventFunction(
      config.parentName,
      'move',
      e => {
        setBoundsByPosition(position, e.sender, winInstance);
      },
      config.name
    );
  }
};

/**
 * 注册事件
 * @param {String} winName 事件宿主窗口名
 * @param {String} eventName 事件名称
 * @param {Function} fn 事件回调
 * @param {String} relationWin 事件相关窗口名 [目前用于注销事件时，区分Manager绑定的事件和用户自行绑定的事件回调，避免误注销不相关事件回调]
 */
WinsManager.prototype.__registerEventFunction = function (winName, eventName, fn, relation) {
  this.getInstance(winName).on(eventName, fn);
  if (relation) fn.__relation = relation;
  update(this._eventFunctions, `[${winName}][${eventName}]`, v => (Array.isArray(v) ? [...v, fn] : [fn]));
  return this;
};

/**
 * 注销事件
 * @param {String} winName 事件宿主窗口名
 * @param {String | false} eventName 事件名称 [为false时则注销范围为宿主窗口的全部事件回调]
 * @param {String} relation 事件相关窗口名 [若有值，则只会注销相关事件回调，否则取消全部回调]
 * @returns
 */
WinsManager.prototype.__cancelEventFunction = function (winName, eventName, relation) {
  const _winInstance = this.getInstance(winName);
  // 宿主实例不存在时无需再解绑事件
  if (!_winInstance) return;

  const _winEvents = this._eventFunctions?.[winName];
  // 没有事件无需解绑事件
  if (!_winEvents) return;

  if (winName && eventName) {
    let _fns = _winEvents?.[eventName];
    if (!_fns) return;
    _fns.forEach((fn, index) => {
      if (relation && fn.__relation !== relation) return;
      _winInstance.removeListener(eventName, fn);
      _fns[index] = null;
    });
    _winEvents[eventName] = _fns.filter(Boolean);
    _fns = null;
    return;
  }
  if (winName) {
    Object.keys(_winEvents).forEach(_event => {
      const _fns = _winEvents?.[_event];
      if (!_fns) return;

      _fns.forEach((fn, index) => {
        if (relation && fn.__relation !== relation) return;
        _winInstance.removeListener(_event, fn);
        _fns[index] = null;
      });

      _winEvents[_event] = _fns.filter(Boolean);
    });
  }
};

/**
 * 获取当前窗口父窗口名称
 * @param {String} name 当前窗口名称
 * @returns {String} 父窗口名称
 */
WinsManager.prototype.getParentWinName = function (name) {
  return name.replace(/(::)?[^(::)]+$/, '');
};

/**
 * 获取当前窗口所有子窗口名称
 * @param {String} name 当前窗口名称
 * @returns {Array<String>} 子窗口名称
 */
WinsManager.prototype.getSonWinsNames = function (name) {
  return Object.keys(this._wins).map(i => isFatherSonRelationship(name, i));
};

/**
 * 获取窗口实例
 * @param {string} winName
 * @returns {BrowserWindow}
 */
WinsManager.prototype.getInstance = function (winName) {
  return winName ? this._wins[winName] || null : this._wins;
};

// 获取所有显示窗口
WinsManager.prototype.getAllVisibleWindows = function () {
  return Object.keys(this._wins)
    .map(name => ({ name, instance: this._wins[name] }))
    .filter(win => win.instance && win.instance.isVisible());
};

// 隐藏所有窗口
WinsManager.prototype.hiddenAllWindows = function () {
  Object.keys(this._wins).forEach(name => {
    const _instance = this.getInstance(name);
    _instance?.hide && _instance.hide();
  });
};

/**
 *  销毁目标窗口及其所有后代窗口
 *  QUESTION: 按理说 A -> B -> C   (A -> B 表示 A是B的父级窗口)
 *        关闭A窗口后，B、C窗口应该自动关闭
 *        事实上，关闭A窗口后，B自动关闭，但C却没有关闭
 */
WinsManager.prototype.destroy = function (winName) {
  if (!this._wins[winName]) {
    console.error(winName + '窗口不存在');
    return;
  }
  this._wins[winName].close();
};

WinsManager.prototype.destroyAll = function () {
  this.destroy('main');
};

/**
 * 提供外部操作渲染进程实例的能力
 * @param {String} winName 目标窗口名称
 * @param {String} action Browser 实例的方法名
 * @param {...any} args Browser 实例方法传参
 *
 * @remark 不推荐使用，以免产生意料之外的问题
 */
WinsManager.prototype.operate = function (winName, action, ...args) {
  const instance = this.getInstance(winName);
  if (!instance) return;
  instance[action](...args);
};

/**
 * 刷新附属在实例上的数据其中包括
 * bounds 窗口的bounds数据
 * @param {*} name
 */
WinsManager.prototype.freshExtraInfo = function (winName, options = {}) {
  const instance = this.getInstance(winName);
  if (!instance) return;
  // boundsInfo
  if (!instance.bounds) {
    instance.on('resized', function (e) {
      instance.bounds = instance.getBounds();
    });
  }
  instance.bounds = options.bounds || instance.getBounds();
};

WinsManager.prototype.setCustomBounds = function (winName, bounds) {
  const instance = this.getInstance(winName);
  if (!instance) return;
  const { x, y } = instance.getBounds();
  const _bounds = {
    ...(instance.bounds || {}),
    x,
    y,
    ...bounds
  };
  instance.__setBounds && instance.__setBounds(_bounds);
  instance.bounds = _bounds;
};

// ----- Add Plugin Or Tools Or Something -----

/**
 * 为窗口注册开发者工具快捷键
 * @param {String} name 目标窗口名称
 * @param {*} option
 * option.prodValid 是否在生产环境下启用 默认false
 * option.devValid 是否在开发环境下启用 默认true
 * option.hotKey 快捷键 默认 Alt+Shift+T
 *
 */
WinsManager.prototype.addDevTools = function (name, option = {}) {
  const { prodValid = false, devValid = true, hotKey = 'Alt+Shift+T' } = option;
  const instance = this.getInstance(name);
  if ((IS_DEV && devValid) || (!IS_DEV && prodValid)) {
    require('electron-localshortcut').register(instance, hotKey, () => instance.webContents.openDevTools());
  }
};

// ---------------------------------------------

module.exports = WinsManager;
