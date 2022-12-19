const path = require('path');
const MainUpdater = require('./plugins/main.updater.js');
const RendererUpdater = require('./plugins/renderer.updater.js');
const NodeModuleUpdater = require('./plugins/nodeModule.updater.js');
const Updater = require('./updater');

async function getSourceMap ({ sourceDir, destDir, exclude }) {
  const updaterInstance = new Updater({
    sourceDir,
    destDir,
    exclude,
    pluginsConfig: {
      node_module: new NodeModuleUpdater({
        source: path.join(sourceDir, 'node_module')
      }),
      'dist/main': new MainUpdater({
        source: path.join(sourceDir, 'dist/main')
      }),
      'dist/renderer': new RendererUpdater({
        source: path.join(sourceDir, 'dist/renderer')
      })
    }
  });
  return await updaterInstance.init();
}

module.exports = { getSourceMap }
;
