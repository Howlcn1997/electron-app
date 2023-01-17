switch (process.platform) {
  case "darwin":
    require("./darwin");
    break;
  case "win32":
    require("./win32");
    break;
}
