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
    compiler.hooks.emit.tapPromise(
      "BytenodeWebpackPlugin",
      async (compilation) => {
        for (const filename in compilation.assets) {
          if (this.options.exclude(filename)) continue;
          if (!/\.js$/.test(filename)) continue;

          let source = Module.wrap(compilation.assets[filename].source());
          const bytecode = await bytenode.compileElectronCode(source);
          const bytecodeFilename = filename.replace(".js", ".jsc");
          compilation.assets[bytecodeFilename] = {
            source: () => bytecode,
            size: () => bytecode.length,
          };
          source = `require('bytenode');\nrequire('./${bytecodeFilename
            .split(path.sep)
            .pop()}');`;
          compilation.assets[filename] = new RawSource(source);
        }
      }
    );
  }
}

export default ElectronBytenodePlugin;
