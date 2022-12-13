const path = require("path");
const { gt: versionGt } = require("./common/version");
const { generateStagingPercentage } = require("./common/gray-release");
// 版本判断依赖文件
const url = "https://oss.51ifonts.com/client/download/main.latest.json";
// 预更新缓存根目录
const updateCacheDir = "%appData%/[appName]/updater/main";
// 本地文件引导文件
const indexPath = path.join(updateCacheDir, "index.json");

function init() {
  // 创建缓存目录
  // 创建version1（快捷方式）
  // 创建index.json
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
  // 检查是否有新的更新
  // 修改相关index.json文件信息
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
  const indexJson = await readJsonPromise(indexPath);
  if (indexJson) {
    return indexJson.version;
  }
  const originalIndexJson = await readJsonPromise(path.join(__dirname, "./index.json"));
  if (originalIndexJson) {
    return originalIndexJson.main;
  }
  return "";
}

async function readJsonPromise(_path) {
  const content = await readFilePromise(_path);
  let indexJson = "";
  try {
    indexJson = JSON.parse(content);
  } catch (e) {
    console.error(`Failed to read json:[${_path}]`, e);
  }
  return indexJson;
}

function readFilePromise(_path) {
  const fs = require("fs");
  return new Promise((resolve, reject) => {
    fs.readFile(_path, (err, data) => {
      if (err) {
        resolve("");
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  getResource: process.env.NODE_ENV === "production" ? getResourceProd : getResourceDev,
  checkUpdate,
};
