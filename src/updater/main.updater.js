const path = require("path");
const fsx = require("fs-extra");
const { gt: versionGt } = require("./common/version");
const { generateStagingPercentage } = require("./common/gray-release");
// 版本判断依赖文件
const url = "https://oss.51ifonts.com/client/download/main.latest.json";
// 预更新缓存根目录
const updateCacheDir = "%appData%/[appName]/updater/main";
// 本地文件引导文件
const indexPath = path.join(updateCacheDir, "index.json");

let initSuccess = false;
async function init({ depth = Infinity } = {}) {
  if (initSuccess) return true;
  await ensureDir(updateCacheDir);
  // 有无index.json
  const indexJsonExist = await fsx.pathExists(indexPath);
  if (!indexJsonExist) {
    const currentVersion = await getCurrentVersion();
    await fsx.writeJSON(indexPath, { current: path.join(updateCacheDir, currentVersion), main: "" });
  }

  // 有无[version]资源【无则创建快捷方式】

  // 有无结构标识文件stc.json

  return initSuccess;
}

async function getResourceProd(rootPath, relativePath) {
  // 获取%appPath%/[appName]/updater/main/index.json
  //       是否获取成功 ---是---> 返回index.json中记录的路径信息
  //                  ---否---> 返回默认入口文件
  const root = path.join(rootPath, "./main/main.js");
  return root;
}

async function getResourceDev(rootPath, relativePath) {
  const root = path.join(rootPath, "./main/main.js");
  return root;
}

async function checkUpdate() {
  // 获取版本依赖文件
  const info =
    '{"version":"2.5.0-2022.12.13.12.01.01","stagingPercentage":"20","downloadRootUrl":"https://oss.51ifonts.com/client/download/main/"}';
  const infoJson = parseReleaseInfo(info, "json");
  const needUpdate = await needUpdateCheck(infoJson);
  if (!needUpdate) return false;
  const initSuccess = await init();
  if (!initSuccess) return false;
}

/**
 * @param {Any} info
 * @param {String} inputType 信息格式 json | yml
 *
 * @return {JSON} json格式的info
 *
 * @desc 由于json格式文件冗余信息较多，后续考虑更换为yaml格式
 */
function parseReleaseInfo(info, inputType = "json") {
  return JSON.parse(info);
}

async function needUpdateCheck({ version, stagingPercentage = 100 }) {
  // 版本判断
  const currentVersion = await getCurrentVersion();
  const isNewVersion = versionGt(version, currentVersion);
  if (!isNewVersion) return false;
  // 灰度判断
  const currentStagingPercentage = await generateStagingPercentage(version);
  if (currentStagingPercentage > +stagingPercentage) return false;
  return true;
}

async function getCurrentVersion() {
  try {
    const indexJson = await fsx.readJSON(indexPath);
    return indexJson.version;
  } catch (e) {}
  try {
    const originalIndexJson = await fsx.readJSON(path.join(__dirname, "./index.json"));
    return originalIndexJson.main;
  } catch (e) {}

  return "";
}

/**
 * 下载差量包
 */
function downloadDiff() {}

function mergeDiff() {}

module.exports = {
  getResource: process.env.NODE_ENV === "production" ? getResourceProd : getResourceDev,
  checkUpdate,
};
