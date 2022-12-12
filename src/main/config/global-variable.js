const path = require("path");
const { app } = require("electron");

let variableValue = null;
const variable = new Proxy(
  {},
  {
    get(_, prop, b) {
      if (prop === "value") {
        if (variableValue) return variableValue;
        variableValue = {
          _IS_DEV_: require("electron-is-dev"),
          _IS_WIN_: process.platform === "win32",
          _IS_MAC_: process.platform === "darwin",
          _APP_PATH_: require("electron-is-dev") ? app.getAppPath() : path.join(app.getAppPath(), "app"),
          _USER_DATA_: app.getPath("userData"),
          _TEMP_PATH_: app.getPath("temp"),
          _dbPath: path.join(process.cwd(), "/resource/release/db"),
        };
        return variableValue;
      }
    },
  }
);

module.exports = { variable };
