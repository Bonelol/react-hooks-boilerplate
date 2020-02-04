/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * generator/index.js
 *
 * Exports the generators so plop knows them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const componentGenerator = require('./component/index.js');
const pageGenerator = require('./page/index.js');
const reducerGenerator = require('./reducer/index.js');
const storeGenerator = require('./store/index.js');

/**
 * Every generated backup file gets this extension
 * @type {string}
 */
const BACKUPFILE_EXTENSION = 'rbgen';

module.exports = plop => {
  plop.setGenerator('component', componentGenerator);
  plop.setGenerator('page', pageGenerator);
  plop.setGenerator('store', storeGenerator);
  plop.addHelper('directory', comp => {
    try {
      fs.accessSync(
        path.join(__dirname, `../../src/pages/${comp}`),
        fs.F_OK
      );
      return `pages/${comp}`;
    } catch (e) {
      return `components/${comp}`;
    }
  });
  plop.addHelper('curly', (object, open) => (open ? '{' : '}'));
  plop.setActionType('prettify-folder', (answers, config) => {
    const folderPath = `${path.join(
      __dirname,
      '/../../src/',
      config.path,
      plop.getHelper('properCase')(answers.name),
      '**',
      '**.ts'
    )}`;

    execSync(`npm run prettify -- "${folderPath}"`);

    return folderPath;
  });
  plop.setActionType('prettify-file', (answers, config) => {
    const folderPath = `${path.join(
      __dirname,
      '/../../src/',
      config.path
    )}`;

    execSync(`npm run prettify -- "${folderPath}"`);

    return folderPath;
  });
  plop.setActionType('backup', (answers, config) => {
    fs.copyFileSync(
      path.join(__dirname, config.path, config.file),
      path.join(
        __dirname,
        config.path,
        `${config.file}.${BACKUPFILE_EXTENSION}`
      ),
      'utf8'
    );
    return path.join(
      __dirname,
      config.path,
      `${config.file}.${BACKUPFILE_EXTENSION}`
    );
  });
};

module.exports.BACKUPFILE_EXTENSION = BACKUPFILE_EXTENSION;
