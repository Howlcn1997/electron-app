const { exec } = require("child_process");
const path = require("path");
(async () => {
    console.log(__dirname)
  const r1 = await exec(`cd ../../src/renderer`);
  console.log(__dirname)
  await exec(`./node_modules/.bin/umi dev`, { },(error) => {console.error(error)});
  // await exec(`cd ${process.cwd()}`);
  // await exec(`npm start`);
})();
// 2）设置环境变量。
// 3）编译主进程代码。
// 4）启动Electron子进程，并加载Vue3项目的首页。
