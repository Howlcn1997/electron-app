const path = require("path");
const fsx = require("fs-extra");
const compressing = require("compressing");
const { download } = require("../utils/download");
const { dirMerge } = require("../utils/file-system.js");
const Updater = require("../utils/updater.js");

const STC_NAME = "package-lock.json";

/**
 * node_modules文件夹下必须有package-lock.json
 */

class NodeModulesUpdater extends Updater {
  constructor(props) {
    super(props);
    this.env.stc = path.join(props.dest, STC_NAME);
    this.checkUpdate();
  }

  async checkUpdate() {
    try {
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
      await fsx.writeJson(path.join(this.env.next, STC_NAME), nextStc);
      // update index.json
      const indexJson = await fsx.readJson(this.env.index);
      await fsx.writeJson(this.env.index, {
        ...indexJson,
        version: nextInfoJson.version,
        oldVersion: indexJson.version,
        next: this.env.next,
        updated: true,
      });
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
        stcJson = await fsx.readJSON(path.join(this.env.source, STC_NAME));
      } catch (e) {
        console.error("Failed to getCurrentStc for updater");
        stcJson = { packages: [] };
      }
    }
    return stcJson;
  }

  getNextReleaseInfo() {
    const http = require("http");
    return new Promise((resolve, reject) => {
      http
        .get(this.url + "release.json", (response) => {
          let todo = "";

          response.on("data", (chunk) => {
            todo += chunk;
          });

          response.on("end", () => {
            try {
              resolve(JSON.parse(todo));
            } catch (e) {
              reject(new Error(`${this.url + "release.json"} is not valid JSON`));
            }
          });
        })
        .on("error", reject);
    });
  }

  async getNextStc() {
    const http = require("http");
    return new Promise((resolve, reject) => {
      http
        .get(this.url + STC_NAME, (response) => {
          let todo = "";

          response.on("data", (chunk) => {
            todo += chunk;
          });

          response.on("end", () => {
            try {
              resolve(JSON.parse(todo));
            } catch (e) {
              reject(new Error(`${this.url + STC_NAME} is not valid JSON`));
            }
          });
        })
        .on("error", reject);
    });
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
