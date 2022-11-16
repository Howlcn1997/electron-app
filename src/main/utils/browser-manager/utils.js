// browser 相关方法
function isPercentage (string) {
  return String(string).includes('%');
}
function isCalc (string) {
  return /^(calc\().*\)$/.test(string + '');
}

function operation (arg1, operator, arg2) {
  switch (operator) {
    case '+':
      return arg1 + arg2;
    case '-':
      return arg1 - arg2;
    case '*':
      return arg1 * arg2;
    case '/':
      return arg1 / arg2;
  }
}

/**
 * 将表达式转化为精确数值
 * @param {String} expression
 * @param {String} boundsSize
 * @returns {Number}
 */
function convertedPosition (expression, boundsSize) {
  let _result = expression;
  if (isPercentage(expression)) {
    _result = (parseInt(expression) / 100) * boundsSize;
  }
  // calc 暂时只支持 单运算符表达式 需要严格按照calc(数值 元算符 数值)
  if (isCalc(expression)) {
    let [arg1, operator, arg2] = expression
      .replace(/(calc\()|\)/g, '')
      .split(' ');
    arg1 = isPercentage(arg1) ? (parseInt(arg1) / 100) * boundsSize : +arg1;
    arg2 = isPercentage(arg2) ? (parseInt(arg2) / 100) * boundsSize : +arg2;
    _result = operation(arg1, operator, arg2);
  }
  return +_result;
}

/**
 *  将position转化成相对于父亲窗口的整型数据
 * @param {Object} position
 * @param {Object} baseBounds
 * @return {Object} num position
 */
function getNumberPosition (position, baseBounds) {
  const { x, y, width, height } = baseBounds;
  const _numPosition = {};

  if ('top' in position) {
    _numPosition.top = Math.ceil(y + convertedPosition(position.top, height));
  }
  if ('bottom' in position) {
    _numPosition.bottom = Math.ceil(
      y + height - convertedPosition(position.bottom, height)
    );
  }
  if ('left' in position) {
    _numPosition.left = Math.ceil(x + convertedPosition(position.left, width));
  }
  if ('right' in position) {
    _numPosition.right = Math.ceil(
      x + width - convertedPosition(position.right, width)
    );
  }
  return _numPosition;
}

/**
 *
 * @param {*} position 定位信息
 * @param {*} parentWin 父窗口实例
 * @param {*} sonWin 子窗口实例
 *
 * position 参照CSS position 体系
 * {
 *    top: 百分比 || number || calc      【百分比是相对与父亲窗口的尺寸，calc中的百分比也是】
 *    bottom: 百分比 || number || calc    calc(100% + 200)
 *    left: 百分比 || number || calc      200
 *    right: 百分比 || number || calc     -100%
 * }
 */
function setBoundsByPosition (position, parentWin, sonWin) {
  const _numPosition = getNumberPosition(position, parentWin.getBounds());
  const { top, bottom, left, right } = _numPosition;
  const { width, height } = sonWin.getBounds();
  sonWin.setBounds({
    x: left || right - width,
    y: top || bottom - height
  });
  if (top && bottom && top < bottom) {
    // 改变子窗口高度
    sonWin.setBounds({ height: bottom - top });
  }
  if (left && right && left < right) {
    // 改变子窗口宽度
    sonWin.setBounds({ width: right - left });
  }
}

/**
 * 是否为父子关系
 * @param {String} parentName 父亲窗口名称
 * @param {String} sonName 子窗口名称
 * @returns
 */
function isFatherSonRelationship (parentName, sonName) {
  const _winNameLv = (parentName.match(/::/g) || []).length;
  return (
    sonName.startsWith(parentName) &&
    (sonName.match(/::/g) || []).length === _winNameLv + 1
  );
}

function resetBrowser (instance, config) {
  console.time('resetBrowser');
  if ('x' in config || 'y' in config) {
    instance.setPosition(config.x, config.y);
  }
  if ('width' in config || 'height' in config) {
    instance.setSize(config.width, config.height);
  }
  if ('center' in config) {
    instance.center();
  }
  if ('minHeight' in config || 'minWidth' in config) {
    instance.setMinimumSize(config.minWidth, config.minHeight);
  }
  if ('resizable' in config) {
    instance.setResizable(config.resizable);
  }
  if ('movable' in config) {
    instance.setResizable(config.resizable);
  }
  if ('minimizable' in config) {
    instance.setResizable(config.resizable);
  }
  if ('maximizable' in config) {
    instance.setResizable(config.resizable);
  }
  if ('closable' in config) {
    instance.setClosable(config.closable);
  }
  if ('focusable' in config) {
    instance.setFocusable(config.focusable);
  }
  if ('alwaysOnTop' in config) {
    const [alwaysOnTop, ...args] =
      typeof config.alwaysOnTop === 'boolean'
        ? [config.alwaysOnTop]
        : config.alwaysOnTop.split(':');
    instance.setAlwaysOnTop(alwaysOnTop, ...args);
  }
  if ('fullscreen' in config) {
    instance.setFullscreen(config.fullscreen);
  }
  if ('fullscreenable' in config) {
    instance.setFullscreenable(config.fullscreenable);
  }
  if ('simpleFullscreen' in config) {
    instance.setSimpleFullScreen(config.simpleFullscreen);
  }
  if ('skipTaskbar' in config) {
    instance.setSkipTaskbar(config.skipTaskbar);
  }
  if ('title' in config) {
    instance.setTitle(config.title);
  }
  if ('loadURL' in config) {
    // instance.loadURL(config.loadURL);
    instance.webContents.loadURL(config.loadURL);
  }
  if ('loadFile' in config) {
    instance.loadFile(config.loadFile);
  }
  console.timeEnd('resetBrowser');
  return instance;
}

module.exports = {
  isFatherSonRelationship,
  setBoundsByPosition,
  convertedPosition,
  getNumberPosition,
  isPercentage,
  isCalc,
  operation,
  resetBrowser
};
