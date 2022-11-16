
const { BrowserWindow } = require('electron');
const { resetBrowser } = require('./utils');

const pool = [];

class BrowserWindowPool {
  constructor (defaultConfig = {}, depth = 1) {
    this.pool = pool;
    this._depth = depth;
    this._defaultConfig = defaultConfig;
    this.__initPool(depth);
  }

  // Generate a pool of instance
  __generateInstance (config = { show: false }) {
    const instance = new BrowserWindow({ ...this._defaultConfig, ...config });
    // instance.loadURL('https://ifonts.com');
    return instance;
  }

  // Initialize the pool
  __initPool (depth) {
    while (depth > 0) {
      --depth;
      this.pool.push(this.__generateInstance());
    }
  }

  getBrowserWindow (config) {
    this.pool.push(this.__generateInstance());
    return resetBrowser(this.pool.shift(), config);
  }
}

module.exports = { BrowserWindowPool };
