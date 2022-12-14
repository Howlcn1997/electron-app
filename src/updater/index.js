const fsx = require("fs-extra");
const path = require("path");
const MainUpdater = require("./main.updater.js");
const RendererUpdater = require("./renderer.updater.js");
const NodeModuleUpdater = require("./nodeModule.updater.js");

const proxyRootPath = path.join(global._APP_PATH_, "../../app");
const updaterRootPath = path.join(global._USER_DATA_, "updater/app");

async function init() {
  // 每个模块getInfo返沪的信息必须为 {path: "",updated: Boolean}
  // path为当前模块当前版本的目录地址，updated标识当前模块是否发生更新
  // path用于创建junction            updated用于判断是否重新创建junction
  const junctionsMap = {
    node_module: new NodeModuleUpdater({ source: path.join(proxyRootPath, "node_module") }),
    "dist/main": new MainUpdater({ source: path.join(proxyRootPath, "dist/main") }),
    "dist/renderer": new RendererUpdater({ source: path.join(proxyRootPath, "dist/renderer") }),
    "dist/dll": new DllUpdater({ source: path.join(proxyRootPath, "dist/renderer") }),
  };
  // 清理失效的junction
  await junctionsClean(Object.keys(junctionsMap));
  // 生成资源镜像树
  await generateJunctions(junctionsMap);

  return {
    "dist/main": path.join(updaterRootPath, "dist/main"),
    "dist/renderer": path.join(updaterRootPath, "dist/renderer"),
  };
}

async function generateJunctions(junctionsMap) {
  for (let relativePath in junctionsMap) {
    const updater = junctionsMap[relativePath];
    const { path: _resourcePath, updated } = await updater.getInfo();
    const fullPath = path.join(updaterRootPath, relativePath);
    await fsx.ensureDir(path.join(fullPath, "../"));
    await fsx.symlink(_resourcePath, fullPath);
  }
  //TODO: junctionsMap中描述的可能不是完整的文件结构，则需要根据proxyRootPath生成完整的镜像树
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
