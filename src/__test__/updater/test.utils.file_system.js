const { dirBFIterator, dirMerge } = require('../../updater/utils/file-system');

dirMerge(
  '/Users/ning/Desktop/test/node_modules_1',
  '/Users/ning/Desktop/test/node_modules_2',
  '/Users/ning/Desktop/test/node_modules',
  1
);
