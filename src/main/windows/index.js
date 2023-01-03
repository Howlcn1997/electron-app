const main = require('./main');
const windows = { main };
function newWindow (name, props) {
  const create = windows.main;
  if (!create) throw new Error(`cant create [${name}]`);
  return create(props);
}

module.exports = { newWindow };
// function create (props = {}) {
//   const main = require('../managers/browser').create({
//     width: 800,
//     height: 800,
//     name: 'main',
//     show: true,
//     loadURL: global._RENDERER_URL_,
//     webPreferences: {
//       enableRemoteModule: true
//     },
//     ...props
//   });
//   main.webContents.openDevTools();
//   return main;
// }

// module.exports = { newMain: create };
