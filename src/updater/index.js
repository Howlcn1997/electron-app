const path = require('path');
const MainUpdater = require('./plugins/main.updater.js');
const RendererUpdater = require('./plugins/renderer.updater.js');
const NodeModuleUpdater = require('./plugins/nodeModule.updater.js');
const Updater = require('./updater');

async function getSourceMap ({ sourceDir, destDir, exclude, isDev = false, ...rest }) {
  const updaterInstance = new Updater({
    sourceDir,
    destDir,
    exclude,
    plugins: {
      node_modules: new NodeModuleUpdater({
        source: path.join(sourceDir, 'node_module'),
        dest: path.join(destDir, './cache/node_modules')
      }),
      'dist/main': new MainUpdater({
        url: 'http://127.0.0.1:5500/app/dist/main/',
        source: path.join(sourceDir, 'dist/main'),
        dest: path.join(destDir, './cache/main')
      }),
      'dist/renderer': new RendererUpdater({
        source: path.join(sourceDir, 'dist/renderer'),
        dest: path.join(destDir, './cache/renderer')
      })
    }
  });
  return await updaterInstance.init();
}
module.exports = { getSourceMap };
