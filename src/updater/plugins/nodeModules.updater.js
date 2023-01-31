const path = require("path");
const fsx = require("fs-extra");
const compressing = require("compressing");
const { download } = require("../utils/download");
const { dirMerge } = require("../utils/file-system.js");
const Updater = require("../utils/updater.js");

/**
 * node_modules文件夹下必须有package-lock.json
 */

class NodeModulesUpdater extends Updater {
  constructor(props) {
    super(props);
    this.stcName = "package-lock.json";
  }

  async checkUpdate() {
    try {
      console.info(`updater [${this.url}] => [checking of updater start]`);
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
      if (!downloadList.length) return false;
      console.info(`updater [${this.url}] => [downloading start] list.length is ${downloadList.length}`);
      // download
      // TODO 防止大量占用带宽导致客户端用户体验下降
      for (let i of downloadList) {
        const downloadUrl = i.resolved;
        const dir = this.env.diff;
        let basename = downloadUrl.split("/");
        basename = basename[basename.length - 1];
        await fsx.ensureDir(dir);
        await download({
          url: downloadUrl,
          dir,
          fileName: basename,
        });
        // 解压 tgz文件 并改名为 relativePath
        const unzipName = i.name.replace("node_modules/", "");
        const zipPath = path.join(dir, basename);
        const outputPath = path.join(dir, unzipName);
        await compressing.tgz.uncompress(zipPath, dir);
        await fsx.rename(path.join(dir, "package"), outputPath);
        await fsx.remove(zipPath);
      }
      // merge
      await dirMerge(this.env.current, this.env.diff, this.env.next, 1);
      await fsx.remove(this.env.diff);
      // update package-lock.json
      await fsx.writeJson(this.env.stc, nextStc);
      // update next/package-lock.json
      await fsx.writeJson(path.join(this.env.next, this.stcName), nextStc);
      // update index.json
      const indexJson = await fsx.readJson(this.env.index);
      await fsx.writeJson(this.env.index, {
        ...indexJson,
        version: nextInfoJson.version,
        oldVersion: indexJson.version,
        next: this.env.next,
        updated: true,
      });
      console.info(`updater [${this.url}] => [checking of updater success]`);
    } catch (e) {
      console.error("Failed to check for updater:", e);
    }
  }

  async getCurrentStc(reScan = false) {
    let stcJson;
    try {
      if (reScan) throw new Error("reScan");
      stcJson = await fsx.readJSON(this.env.stc);
    } catch (e) {
      try {
        stcJson = await fsx.readJSON(path.join(this.env.source, this.stcName));
      } catch (e) {
        console.error("Failed to getCurrentStc for updater:", e);
        stcJson = { packages: [] };
      }
    }
    return stcJson;
  }

  diff(currentStc, nextStc) {
    const { packages: currentPackages } = currentStc;
    const { packages: nextPackages } = nextStc;
    return Object.keys(nextPackages)
      .filter((key) => {
        if (!currentPackages[key]) return true;
        if (currentPackages[key].version !== nextPackages[key].version) {
          return true;
        }
        return false;
      })
      .map((key) => ({ ...nextPackages[key], name: key }));
  }
}

module.exports = NodeModulesUpdater;
