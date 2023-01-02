const path = require('path');
const fsx = require('fs-extra');
const https = require('https');
const hasha = require('hasha');
const { gt: versionGt } = require('../utils/version');
const { generateStagingPercentage } = require('../utils/gray-release');
const { download } = require('../utils/download');
const { dirMerge, dirBFIterator } = require('../utils/file-system');

class MainUpdater {
  constructor (props) {
    this.url = props.url;
    this.env = {
      // 源文件
      source: props.source,
      dest: props.dest,
      current: path.join(props.dest, 'current'),
      diff: path.join(props.dest, 'diff'),
      next: path.join(props.dest, 'next'),
      // 本地文件引导文件
      index: path.join(props.dest, 'index.json'),
      // 当前文件结构
      stc: path.join(props.dest, 'stc.json')
    };
    this.nextVersion = props.nextVersion;
    this.initSuccess = false;
    this.checkUpdate();
  }

  async getInfo () {
    // 获取cache中index.json记录的信息
    let indexJson = '';
    try {
      indexJson = await fsx.readJSON(this.env.index);
    } catch (e) {
      indexJson = {
        current: this.env.source,
        next: '',
        version: '',
        updated: false
      };
    }
    let currentPath = indexJson.current;
    const updated = indexJson.updated;
    if (updated) {
      currentPath = indexJson.next;
      await fsx.rename(this.env.current, this.env.current + '.old');
      try { await fsx.rename(this.env.next, this.env.current); } catch (e) {
        await fsx.rename(this.env.current + '.old', this.env.current);
      }
      await fsx.remove(this.env.current + '.old');
      const stcJson = await this.getCurrentStc(true);
      await fsx.writeJSON(this.env.stc, stcJson);
      await fsx.writeJSON(this.env.index, {
        ...indexJson,
        next: '',
        current: this.env.current,
        updated: false
      });
    }
    return {
      path: currentPath,
      updated
    };
  }

  async init ({ depth = Infinity } = {}) {
    if (this.initSuccess) return true;
    const currentVersion = await this.getCurrentVersion();
    const indexJsonExist = await fsx.pathExists(this.env.index);
    if (!indexJsonExist) {
      await fsx.ensureDir(path.dirname(this.env.index));
      await fsx.writeJSON(this.env.index, {
        current: '',
        next: '',
        version: currentVersion,
        main: 'main.js'
      });
    }
    // 有无[version]资源【无则创建快捷方式】
    const currentVersionPath = path.join(this.env.dest, 'current');
    const currentVersionExist = await fsx.pathExists(currentVersionPath);
    if (!currentVersionExist) {
      await fsx.symlink(this.env.source, currentVersionPath, 'junction');
    }

    // 有无结构标识文件stc.json
    const stcJsonExist = await fsx.pathExists(this.env.stc);
    if (!stcJsonExist) {
      const stcJson = await this.getCurrentStc();
      await fsx.writeJSON(this.env.stc, stcJson);
    }

    return (this.initSuccess = true);
  }

  async getResourceProd (rootPath, relativePath) {
    // 获取%appPath%/[appName]/updater/main/index.json
    //       是否获取成功 ---是---> 返回index.json中记录的路径信息
    //                  ---否---> 返回默认入口文件
    const root = path.join(rootPath, './main/main.js');
    return root;
  }

  async getResourceDev (rootPath, relativePath) {
    const root = path.join(rootPath, './main/main.js');
    return root;
  }

  async checkUpdate () {
    // 获取版本依赖文件
    const nextInfoJson = await this.getNextReleaseInfo();
    const needUpdate = await this.needUpdateCheck(nextInfoJson);
    if (!needUpdate) return false;
    const initSuccess = await this.init();
    if (!initSuccess) return false;
    // diff
    const currentStc = await this.getCurrentStc();
    const nextStc = await this.getNextStc();
    const downloadList = await this.diff(currentStc, nextStc);
    // download
    // TODO 防止大量占用带宽导致客户端用户体验下降
    await Promise.all(
      downloadList.map(async (i) => {
        const target = path.join(this.env.diff, i.relativePath);
        const dir = path.dirname(target);
        const basename = path.basename(target);
        await fsx.ensureDir(dir);
        await download({
          url: nextInfoJson.url + i.relativePath,
          dir,
          fileName: basename
        });
      })
    );
    // merge
    await dirMerge(this.env.current, this.env.diff, this.env.next);
    await fsx.remove(this.env.diff);
    // update index.json
    const indexJson = await fsx.readJson(this.env.index);
    await fsx.writeJson(this.env.index, {
      ...indexJson,
      version: nextInfoJson.version,
      oldVersion: indexJson.version,
      next: this.env.next,
      updated: true
    });
  }

  async needUpdateCheck ({ version, stagingPercentage = 100 }) {
    // 版本判断
    const currentVersion = await this.getCurrentVersion();
    const isNewVersion = versionGt(version, currentVersion);
    if (!isNewVersion) return false;
    // 灰度判断
    const currentStagingPercentage = await generateStagingPercentage(version);
    if (currentStagingPercentage > +stagingPercentage) return false;
    return true;
  }

  async getCurrentVersion () {
    try {
      const indexJson = await fsx.readJSON(this.env.index);
      return indexJson.version;
    } catch (e) {}
    try {
      const originalIndexJson = await fsx.readJSON(
        path.join(__dirname, '../config/version.json')
      );
      return originalIndexJson.main;
    } catch (e) {}

    return '';
  }

  async getCurrentStc (reScan = false) {
    let stcJson;
    try {
      if (reScan) throw new Error('reScan');
      stcJson = await fsx.readJSON(this.env.stc);
    } catch (e) {
      const list = (await dirBFIterator(this.env.current)).filter(
        (info) => !info.isDirectory
      );
      const listWithMd5Hash = await Promise.all(
        list.map(async (info) => ({
          ...info,
          hash: await hasha.fromFile(info.path, {
            algorithm: 'md5'
          })
        }))
      );
      stcJson = { list: listWithMd5Hash };
    }
    return stcJson;
  }

  getNextReleaseInfo () {
    const http = require('http');
    return new Promise((resolve, reject) => {
      http
        .get(this.url + 'release.json', (response) => {
          let todo = '';

          response.on('data', (chunk) => {
            todo += chunk;
          });

          response.on('end', () => {
            resolve(JSON.parse(todo));
          });
        })
        .on('error', reject);
    });
  }

  async getNextStc () {
    const http = require('http');
    return new Promise((resolve, reject) => {
      http
        .get(this.url + 'stc.json', (response) => {
          let todo = '';

          response.on('data', (chunk) => {
            todo += chunk;
          });

          response.on('end', () => {
            resolve(JSON.parse(todo));
          });
        })
        .on('error', reject);
    });
  }

  /**
   * 由stcA 到 stcB 的差异点
   *
   * @param {Object} stcA
   * @param {Object} stcB
   *
   * stc ==> {list: [{
   *     path: String,
   *     relativePath: String,
   *     depth: Number,
   *     isDirectory: Boolean,
   *     children: Array
   *   }]}
   */
  diff (currentStc, nextStc) {
    const currentFileObj = {};
    currentStc.list.forEach(
      (info) => (currentFileObj[info.relativePath] = info)
    );
    return nextStc.list.filter((info) => {
      if (!currentFileObj[info.relativePath]) return true;
      if (currentFileObj[info.relativePath].hash !== info.hash) return true;
      return false;
    });
  }
}
module.exports = MainUpdater;
