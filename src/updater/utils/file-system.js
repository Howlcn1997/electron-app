const fsx = require("fs-extra");
const path = require("path");

async function dirBFIterator(rootNodePath, needIterateFn = (currentPath, currentDepth) => true, depth = Infinity) {
  const iterateFnList = [];
  const queue = [{ path: rootNodePath, depth: 0 }];
  while (queue.length) {
    const currentNode = queue.shift();
    const stat = await fsx.stat(currentNode.path);
    const isDirectory = await stat.isDirectory();

    const needIterate = await needIterateFn(currentNode.path, currentNode.depth);
    const relativePath = currentNode.path === rootNodePath ? "" : currentNode.path.replace(rootNodePath + path.sep, "");
    const children = needIterate && isDirectory && currentNode.depth < depth ? await fsx.readdir(currentNode.path) : [];

    iterateFnList.push({
      path: currentNode.path,
      depth: currentNode.depth,
      relativePath,
      rootPath: rootNodePath,
      isDirectory,
      children,
    });

    queue.push(
      ...children.map((i) => ({
        path: path.join(currentNode.path, i),
        depth: currentNode.depth + 1,
      }))
    );
  }
  return iterateFnList;
}

/**
 * 优先保证sourceA的完整性
 * 如sourceA 与 sourceB存在“同层级且同名文件”,则只会保留sourceA的该文件
 * @param {String} sourceA path
 * @param {String} sourceB path
 * @param {String} target path
 */
async function dirMerge(sourceA, sourceB, target, depth) {
  let [listA, listB] = await Promise.all(
    [sourceA, sourceB].map(
      async (rootPath, index) =>
        await dirBFIterator(rootPath, async (fullPath) => await (await fsx.stat(fullPath)).isDirectory(), depth)
    )
  );
  listA = listA.slice(1);
  listB = listB.slice(1);

  const listAObj = {};
  listA.forEach((pathInfo) => (listAObj[pathInfo.relativePath] = pathInfo));
  const listBObj = {};
  listB.forEach((pathInfo) => (listBObj[pathInfo.relativePath] = pathInfo));
  const mergeObj = { ...listBObj, ...listAObj };

  await fsx.ensureDir(target);
  await Promise.all(
    Object.keys(mergeObj).map(async (relativePath) => {
      try {
        await fsx.copy(mergeObj[relativePath].path, path.join(target, relativePath));
      } catch (e) {
        if (e.errno !== -2) console.error("Failed to mergeDir:", e);
      }
    })
  );
  return mergeObj;
}

module.exports = { dirBFIterator, dirMerge };
