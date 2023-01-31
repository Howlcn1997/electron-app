const path = require('path');
const MainUpdater = require('../../updater/plugins/main.updater.js');
const RendererUpdater = require('../../updater/plugins/renderer.updater.js');
const NodeModulesUpdater = require('../../updater/plugins/nodeModules.updater.js');
const Updater = require('../../updater/updater');

async function getSourceMap ({
  sourceDir,
  destDir,
  exclude,
  isDev = false,
  ...rest
}) {
  const updaterInstance = new Updater({
    sourceDir,
    destDir,
    exclude,
    plugins: {
      node_modules: new NodeModulesUpdater({
        url: 'http://127.0.0.1:5500/0.0.1/node_modules/',
        source: path.join(sourceDir, 'node_modules'),
        dest: path.join(destDir, './cache/node_modules')
      })
      // 'dist/main': new MainUpdater({
      //   url: 'http://127.0.0.1:5500/0.0.2/app/dist/main/',
      //   source: path.join(sourceDir, 'dist/main'),
      //   dest: path.join(destDir, './cache/main')
      // }),
      // 'dist/renderer': new RendererUpdater({
      //   url: 'http://127.0.0.1:5500/0.0.2/app/dist/renderer/',
      //   source: path.join(sourceDir, 'dist/renderer'),
      //   dest: path.join(destDir, './cache/renderer')
      // })
    }
  });
  return await updaterInstance.init();
}

(async () => {
  const sourceDir = '/Users/ning/Desktop/local/app';
  const destDir = '/Users/ning/Desktop/dest';

  const sourceMap = await getSourceMap({
    sourceDir,
    destDir
  });
  console.log('sourceMap===>', sourceMap);
})();

// require('./test.file-system');

// const Updater = require('../../../src/updater/utils/updater');
// (() => {
//   const ins = new Updater({
//     url: 'http://127.0.0.1:5500/0.0.1/app/main/',
//     source: '/Users/ning/Desktop/version/0.0.1/app/dist/renderer',
//     dest: '/Users/ning/Desktop/dest'
//   });
// })();
