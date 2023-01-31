const Updater = require('../utils/updater');

class MainUpdater extends Updater {
  constructor (props) {
    super(props);
    this.checkUpdate();
  }
}
module.exports = MainUpdater;
