import Module from "module";
import path from "path";
import bytenode from "bytenode";
import { sources } from "webpack";
import v8 from "v8";

v8.setFlagsFromString("--no-lazy");
const { RawSource } = sources;

class ElectronBytenodePlugin {
  constructor(options = {}) {
    this.options = Object.assign(
      {
        exclude: (filename) => false,
        // 删除源文件，生成jsc入口文件
        generateEntry: true,
      },
      options
    );
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise("BytenodeWebpackPlugin", async (compilation) => {
      for (const filepath in compilation.assets) {
        if (this.options.exclude(filepath)) continue;
        if (!/\.js$/.test(filepath)) continue;

        let source = Module.wrap(compilation.assets[filepath].source());
        const jscCode = await bytenode.compileElectronCode(source);
        const jscFilename = path.basename(filepath, ".js") + ".jsc";
        const jscFilepath = filepath.replace(".js", ".jsc");

        compilation.assets[jscFilepath] = {
          source: () => jscCode,
          size: () => jscCode.length,
        };
        source = `require('bytenode');\nrequire('./${jscFilename}');`;
        compilation.assets[filepath] = new RawSource(source);
      }
    });
  }
}

export default ElectronBytenodePlugin;
