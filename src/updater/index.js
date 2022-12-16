const fsx = require("fs-extra");
const path = require("path");
const MainUpdater = require("./plugins/main.updater.js");
const RendererUpdater = require("./plugins/renderer.updater.js");
const NodeModuleUpdater = require("./plugins/nodeModule.updater.js");

const proxyRootPath = path.join(global._APP_PATH_, "../../app");

// 更新器根目录
const updaterDir = path.join(global._USER_DATA_, "updater");
// 更新器源代码缓存目录
const updaterCacheDir = path.join(updaterDir, "cache");
//
const updaterISOName = path.basename(proxyRootPath);
const updaterISOPath = path.join(updaterDir, updaterISORootName);

async function init() {
  // 每个模块getInfo返沪的信息必须为 {path: "",updated: Boolean}
  // path为当前模块当前版本的目录地址，updated标识当前模块是否发生更新
  // path用于创建junction            updated用于判断是否重新创建junction
  const junctionsMap = {
    node_module: new NodeModuleUpdater({ source: path.join(updaterISOPath, "node_module") }),
    "dist/main": new MainUpdater({ source: path.join(updaterISOPath, "dist/main") }),
    "dist/renderer": new RendererUpdater({ source: path.join(updaterISOPath, "dist/renderer") }),
  };

  const needBuildJunctions = needBuilderNextJunctions();

  // 生成资源镜像树
  await junctionsBuilder(junctionsMap, "app.next");

  await junctionsSwitcher();

  return {
    "dist/main": path.join(updaterISOPath, "dist/main"),
    "dist/renderer": path.join(updaterISOPath, "dist/renderer"),
  };
}

async function junctionsSwitcher() {
  // 将app junctions树更名为app.old
  // 将app.next junctions树更名为app
  return {
    node_module: "junctionsPath",
    "dist/main": "junctionsPath",
    "dist/renderer": "junctionsPath",
  };
}

function junctionsClearer(list) {
  return Promise.all(
    list.map(async (relativePath) => {
      const fullPath = path.join(updaterISOPath, relativePath);
      const exists = await fsx.pathExists(fullPath);
      if (!exists) await fsx.remove(fullPath);
    })
  );
}

/**
 * 是否需要新建junctions树
 *
 * @return {Boolean}
 */
function needBuilderNextJunctions() {
  return true;
}

async function junctionsBuilder(junctionsMap, rootName = "app.next") {
  for (let relativePath in junctionsMap) {
    const updater = junctionsMap[relativePath];
    const { path: _resourcePath, updated } = await updater.getInfo();
    const fullPath = path.join(updaterISOPath, relativePath);
    await fsx.ensureDir(path.join(fullPath, "../"));
    await fsx.symlink(_resourcePath, fullPath);
  }
  //TODO: junctionsMap中描述的可能不是完整的文件结构，则需要根据proxyRootPath生成完整的镜像树
}
