const fsx = require('fs-extra');
const path = require('path');

class Updater {
  constructor (props) {
    this.pluginsConfig = props.pluginsConfig;
    this.sourceDir = props.sourceDir;
    this.destDir = props.destDir;
    this.exclude = props.exclude;

    this.updaterCacheDir = path.join(props.destDir, 'cache');
    this.updaterISOName = path.basename(props.sourceDir);
  }

  /**
   *
   * 每个模块updaterInstance的getInfo返回的信息必须为 {path: "",updated: Boolean} 格式
   * path为当前模块当前版本的目录地址，updated标识当前模块是否发生更新
   * path用于创建ISO            updated用于判断是否重新创建ISO
   *
   * @param {Object} plugins {[key]: updaterInstance}
   */
  async init () {
    const updateInfos = await this.updaterMapToUpdaterInfo(this.pluginsConfig);
    const needBuild = await this.needBuilderNextISO(updateInfos);

    const currentISOPath = path.join(this.destDir, this.updaterISOName);
    if (needBuild) {
      // 生成资源镜像树
      await this.buildISO(updateInfos, `${this.updaterISOName}.next`);
      await this.switchISO(this.updaterISOName, `${this.updaterISOName}.next`);
    }

    const pluginsConfig = { ...this.pluginsConfig };
    for (const key in pluginsConfig) {
      pluginsConfig[key] = path.join(currentISOPath, key);
    }
    return pluginsConfig;
  }

  async switchISO () {
    const oldPath = path.join(this.destDir, `${this.updaterISOName}.old`);
    const currentPath = path.join(this.destDir, this.updaterISOName);
    const nextPath = path.join(this.destDir, `${this.updaterISOName}.next`);
    await fsx.remove(oldPath);
    // 将app junctions树更名为app.old
    if (await fsx.pathExists(currentPath)) {
      await fsx.rename(currentPath, oldPath);
    }
    // 将app.next junctions树更名为app
    await fsx.rename(nextPath, currentPath);
    return {
      node_module: 'junctionsPath',
      'dist/main': 'junctionsPath',
      'dist/renderer': 'junctionsPath'
    };
  }

  cleanISO (list) {
    return Promise.all(
      list.map(async (relativePath) => {
        const fullPath = path.join(this.destDir, relativePath);
        const exists = await fsx.pathExists(fullPath);
        if (!exists) await fsx.remove(fullPath);
      })
    );
  }

  async updaterMapToUpdaterInfo (pluginsConfig) {
    const pluginsConfigKeys = Object.keys(pluginsConfig);
    const updateInfos = await Promise.all(
      pluginsConfigKeys.map(async (relativePath) => {
        const updaterInstance = pluginsConfig[relativePath];
        return {
          ...(await updaterInstance.getInfo()),
          relativePath
        };
      })
    );
    // [{path: "", updated: true}]
    return updateInfos;
  }

  /**
   * 是否需要新建junctions树
   * 当junctionsMap中任意更新器发生更新,则返回true
   *
   * @return {Boolean}
   */
  async needBuilderNextISO (updaterInfos) {
    return updaterInfos.some((info) => info.updated);
  }

  /**
   * 构建junctions
   * @param {*} updaterInfos
   * @param {*} rootName
   */
  async buildISO (updaterInfos, rootName) {
    const relativePaths = updaterInfos.map((i) => i.relativePath);

    // 从根目录开始构建
    const buildGuide = pathsToTree(relativePaths);
    await dirBFIterator(this.sourceDir, async (currentFullPath) => {
      if (currentFullPath === this.sourceDir) return true;
      if (this.exclude && this.exclude(currentFullPath)) return false;

      const relativePath = currentFullPath.replace(
        this.sourceDir + path.sep,
        ''
      );
      const currentBasename = path.basename(currentFullPath);
      const currentDepth = relativePath.split(path.sep).length - 1;

      const needIterate = buildGuide[currentDepth].some(
        (i) => i.name === currentBasename && i.children > 0
      );
      if (needIterate) return true;

      // 优先获取更新器中的路径
      const sourceFullPath =
        updaterInfos.find((i) => i.path === relativePath)?.path ||
        currentFullPath;
      const targetFullPath = path.join(this.destDir, rootName, relativePath);

      await fsx.remove(targetFullPath);
      await fsx.ensureDir(path.dirname(targetFullPath));
      await fsx.symlink(sourceFullPath, targetFullPath, 'junction');
      return false;
    });
  }
}

async function dirBFIterator (
  rootNodePath,
  needIterateFn = (currentPath) => false
) {
  const queue = [rootNodePath];
  while (queue.length) {
    const currentNodePath = queue.shift();
    const needIterate = await needIterateFn(currentNodePath);
    if (!needIterate) continue;
    const ls = await fsx.readdir(currentNodePath);
    queue.push(...ls.map((i) => path.join(currentNodePath, i)));
  }
}

/**
 * 将形如
 * ["node_modules", "dist/main","dist/renderer"]
 * 转换为
 * [
 *    [{name: "node_modules", children: 0},{name: "dist", children: 2}],
 *    [{name: "main",children: 0}, {name: "renderer", children: 0}]
 * ]
 * @param {Array<String>} paths
 *
 * @ps 前提条件 paths中的路径不存在包含关系  例如["dist/main","dist/main/index"]
 */
function pathsToTree (paths) {
  const resArr = [];
  const resObj = {};
  const pathsSplitArr = paths.map((pth) => pth.split('/'));
  // 先生成 {node_modules: null, dist: {main: null, renderer: null}}
  pathsSplitArr.forEach((arr) => {
    let parentNode = resObj;
    arr.forEach((name, index, array) => {
      if (!parentNode[name]) {
        parentNode[name] = index === array.length - 1 ? null : {};
      }
      parentNode = parentNode[name];
    });
  });
  let currentDepthArr = [resObj];
  let index = 0;
  while (currentDepthArr.length) {
    const _arr = currentDepthArr;
    currentDepthArr = [];
    _arr.forEach((obj) => {
      Object.keys(obj).forEach((name) => {
        if (!resArr[index]) resArr[index] = [];
        const children = obj[name] ? Object.keys(obj[name]).length : 0;
        resArr[index].push({ name, children });
        if (children) {
          currentDepthArr.push(obj[name]);
        }
      });

      index++;
    });
  }
  return resArr;
}

module.exports = Updater;
