/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * reducerExists
 *
 * Check whether the given reducer exist in the reducers directory
 */

const fs = require('fs');
const path = require('path');
const reducers = fs.readdirSync(
  path.join(__dirname, '../../../src/store/reducers')
);
const types = fs.readdirSync(
  path.join(__dirname, '../../../src/store/types')
);
const files = reducers.concat(types);

function storeExists(store) {
  return files.indexOf(store) >= 0;
}

module.exports = storeExists;
