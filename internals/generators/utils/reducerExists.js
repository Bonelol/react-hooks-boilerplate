/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * reducerExists
 *
 * Check whether the given reducer exist in the reducers directory
 */

const fs = require('fs');
const path = require('path');
const reducers = fs.readdirSync(
  path.join(__dirname, '../../../src/store')
);
const types = fs.readdirSync(
  path.join(__dirname, '../../../src/store')
);
const files = reducers.concat(types);

function reducerExists(reducer) {
  return files.indexOf(reducer) >= 0;
}

module.exports = reducerExists;
