/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Component Generator
 */

/* eslint strict: ["off"] */

'use strict';

const componentExists = require('../utils/componentExists');

module.exports = {
  description: 'Generate new component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Component name?',
      default: '',
      validate: value => {
        if (/.+/.test(value)) {
          return componentExists(value)
            ? 'A component or page with this name already exists'
            : true;
        }

        return 'The name is required';
      }
    }
  ],
  actions: data => {
    // Generate index.tsx and index.test.ts
    const actions = [
      {
        type: 'add',
        path: '../../src/components/{{properCase name}}/index.tsx',
        templateFile: './component/index.tsx.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/components/{{properCase name}}/index.scss',
        templateFile: './component/index.scss.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/components/{{properCase name}}/tests/index.test.ts',
        templateFile: './component/test.ts.hbs',
        abortOnFail: true
      }
    ];

    // actions.push({
    //   type: 'prettify-folder',
    //   path: '/components/'
    // });

    return actions;
  }
};
