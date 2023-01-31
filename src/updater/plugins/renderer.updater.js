const Updater = require('../utils/updater');
class RendererUpdater extends Updater {
  constructor (props) {
    super(props);
    this.checkUpdate();
  }
}

module.exports = RendererUpdater;
