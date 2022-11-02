function newWindow (name, props) {
  const create = require(`./${name}.js`);
  if (!create) throw new Error(`cant create [${name}]`);
  return create(props);
}

module.exports = newWindow;
