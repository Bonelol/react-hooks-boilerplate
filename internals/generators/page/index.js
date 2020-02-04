/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Component Generator
 */

/* eslint strict: ["off"] */

'use strict';

const fs = require('fs');
const ts = require('typescript');
const { pascalCase, camelCase } = require('change-case');
const componentExists = require('../utils/componentExists');

module.exports = {
  description: 'Generate new page',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Page name?',
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
        path: '../../src/pages/{{properCase name}}/index.tsx',
        templateFile: './page/index.tsx.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/pages/{{properCase name}}/index.scss',
        templateFile: './page/index.scss.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/pages/{{properCase name}}/tests/index.test.ts',
        templateFile: './page/test.ts.hbs',
        abortOnFail: true
      },
      function modifyApp() {
        const name = data.name;
        const pascal = pascalCase(name);
        const camel = camelCase(name);
        const file = fs.readFileSync('src/app.tsx', 'utf8');
        const sourceFile = ts.createSourceFile(
          'app.tsx',
          file,
          ts.ScriptTarget.ES2015,
          true,
          ts.ScriptKind.TSX
        );

        // import NotFound from '@pages/NotFound/index';
        const importPageStatement = ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(ts.createIdentifier(pascal), undefined),
          ts.createStringLiteral(`@pages/${pascal}/index`)
        );

        const imports = sourceFile.statements.filter(
          s => s.kind === ts.SyntaxKind.ImportDeclaration
        );
        const lastIndex =
          imports.length === 0
            ? 0
            : sourceFile.statements.indexOf(imports[imports.length - 1]);
        sourceFile.statements = ts.createNodeArray([
          ...sourceFile.statements.slice(0, lastIndex + 1),
          importPageStatement,
          ...sourceFile.statements.slice(lastIndex + 1)
        ]);

        const transformer = context => rootNode => {
          function visit(node) {
            // Switch tag
            if (
              node.kind === ts.SyntaxKind.JsxElement &&
              node.openingElement &&
              node.openingElement.tagName.getText() === 'Switch'
            ) {
              const newLine = ts.createJsxText('\n ');
              const page = ts.createJsxSelfClosingElement(
                ts.createIdentifier('Route'),
                undefined,
                ts.createJsxAttributes([
                  ts.createJsxAttribute(
                    ts.createIdentifier('path'),
                    ts.createStringLiteral(`/${camel}`)
                  ),
                  ts.createJsxAttribute(
                    ts.createIdentifier('component'),
                    ts.createJsxExpression(
                      undefined,
                      ts.createIdentifier(pascal)
                    )
                  )
                ])
              );
              node.children = ts.createNodeArray([
                ...node.children.slice(0, 2),
                newLine,
                page,
                ...node.children.slice(2)
              ]);

              return node;
            }
            return ts.visitEachChild(node, visit, context);
          }
          return ts.visitNode(rootNode, visit);
        };

        const result = ts.transform(sourceFile, [transformer]);
        const transformedSourceFile = result.transformed[0];
        const printer = ts.createPrinter();
        const printed = printer.printFile(transformedSourceFile);
        fs.writeFileSync('src/app.tsx', printed);
      }
    ];

    // actions.push({
    //   type: 'prettify-folder',
    //   path: '/pages/'
    // });

    // actions.push({
    //   type: 'prettify-file',
    //   path: '/app.tsx'
    // });

    return actions;
  }
};
