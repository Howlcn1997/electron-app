function parse(versionString) {
  if (!versionString.includes("-")) return { clientVersion: "", version: "", versionArray: [] };

  const [clientVersion, version] = versionString.split("-");
  return [clientVersion, version.split(".").map(Number), version];
}

function gt(version1, version2) {
  const [clientVersion1, versionArray1] = parse(version1);
  const [clientVersion2, versionArray2] = parse(version2);
  if (clientVersion1 !== clientVersion2) return 0;

  const maxLength = Math.max(versionArray1.length, versionArray2.length);
  for (let i = 0; i < maxLength; i++) {
    const version1Num = versionArray1[i] || 0;
    const version2Num = versionArray2[i] || 0;
    if (version1Num > version2Num) return 1;
    if (version1Num < version2Num) return -1;
    if (i === maxLength - 1 && version1Num === version2Num) return 0;
  }
}

/**
 * 生成版本号
 * @param {String} clientVersion
 *
 * @return {String} 版本号  示例：2.5.0-2022.12.13.12.01.01
 */
function generateVersion(clientVersion) {
  const now = new Date();
  return `${clientVersion}-${now.getFullYear()}.${
    now.getMonth() + 1
  }.${now.getDate()}.${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`;
}

module.exports = {
  gt,
  generateVersion,
};
