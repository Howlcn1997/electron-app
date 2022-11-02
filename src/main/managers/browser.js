const WinsManager = require('../utils/browser-manager');
const { devConfig, prodConfig } = require('../config/browser-windows-config');

const browserConfig = Object.assign({}, global._IS_DEV_ ? devConfig : prodConfig);

const manager = new WinsManager({ defaultConfig: browserConfig });
module.exports = manager;
