const fsx = require("fs-extra");
const path = require("app");
const mainUpdater = require("./main.updater.js");
const rendererUpdater = require("./renderer.updater.js");
const nodeModuleUpdater = require("./nodeModule.updater.js");

const installRootPath = "/app";
const updaterRootPath = "updater/app";

async function init() {
  // 每个模块getInfo返沪的信息必须为 {path: "",updated: Boolean}
  // path为当前模块当前版本的目录地址，updated标识当前模块是否发生更新
  // path用于创建junction            updated用于判断是否重新创建junction
  const junctionsMap = {
    node_module: mainUpdater.getInfo,
    "dist/main": rendererUpdater.getInfo,
    "dist/renderer": nodeModuleUpdater.getInfo,
  };
  // 清理失效的
  await junctionsClean(Object.keys(junctionsMap));
  generateJunctions(junctionsMap);
  return {};
}

async function generateJunctions(junctionsMap) {
  for (let relativePath in junctionsMap) {
    const handle = junctionsMap[relativePath];
    const { path: _resourcePath, updated } = await handle();
    const fullPath = path.join(updaterRootPath, relativePath);
    fsx.symlinkSync(_resourcePath, fullPath);
  }
}

function junctionsClean(list) {
  return Promise.all(
    list.map(async (relativePath) => {
      const fullPath = path.join(updaterRootPath, relativePath);
      const exists = await fsx.pathExists(fullPath);
      if (!exists) await fsx.remove(fullPath);
    })
  );
}
