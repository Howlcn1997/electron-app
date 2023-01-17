const path = require("path");

const assetsIcons = path.join("assets/icons");
const iconAssetsRoot = path.join("unrelease/icon/png");
const iconPngName = "icon_radius_padding_1024.png";
const iconsetName = "icons.iconset";

const sizeList = [16, 32, 64, 128, 256, 512, 1024];

const { execSync } = require("child_process");
const fsx = require("fs-extra");
(async () => {
  const iconsetDir = path.join(iconAssetsRoot, iconsetName);
  for (let size of sizeList) {
    fsx.ensureDirSync(iconsetDir);
    await execSync(
      `sips -z ${size} ${size} ${iconPngName} --out icons.iconset/icon_${size}x${size}.png`,
      { cwd: iconAssetsRoot }
    );
  }
  const a = await execSync(`iconutil -c icns ${iconsetName} -o icon.icns`, {
    cwd: iconAssetsRoot,
  });
  fsx.moveSync(
    path.join(iconAssetsRoot, "icon.icns"),
    path.join(assetsIcons, "icon.icns"),
    { overwrite: true }
  );
  fsx.removeSync(iconsetDir);
})();
