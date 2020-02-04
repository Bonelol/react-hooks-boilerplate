/**
 * Reducer Generator
 */
const fs = require('fs');
const ts = require('typescript');
const { pascalCase, camelCase } = require('change-case');
const reducerExists = require('../utils/reducerExists');

module.exports = {
  description: 'Generate new store',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Store name?',
      default: 'Todo',
      validate: value => {
        if (/.+/.test(value)) {
          return reducerExists(value)
            ? 'A store this name already exists'
            : true;
        }

        return 'The name is required';
      }
    }
  ],
  actions: data => {
    const actions = [
      {
        type: 'add',
        path: '../../src/store/{{camelCase name}}/types.ts',
        templateFile: './store/types.ts.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/store/{{camelCase name}}/index.tsx',
        templateFile: './store/index.tsx.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/store/{{camelCase name}}/reducer.ts',
        templateFile: './store/reducer.ts.hbs',
        abortOnFail: true
      },
      function modifyProviders() {
        const name = data.name;
        const pascal = pascalCase(name);
        const camel = camelCase(name);
        const file = fs.readFileSync('src/store/providers.ts', 'utf8');
        const sourceFile = ts.createSourceFile(
          'providers.ts',
          file,
          ts.ScriptTarget.ES2015,
          true,
          ts.ScriptKind.TS
        );

        const importProviderStatement = ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(
            undefined,
            ts.createNamedImports([
              ts.createImportSpecifier(ts.createIdentifier('Provider'), ts.createIdentifier(`${pascal}Provider`))
            ])
          ),
          ts.createStringLiteral(`./${camel}/index`)
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
          importProviderStatement,
          ...sourceFile.statements.slice(lastIndex + 1)
        ]);

        const transformer = context => rootNode => {
          function visit(node) {
            if (node.kind === ts.SyntaxKind.VariableDeclaration) {
              const variable = node;

              if (variable.name.getText() === 'providers') {
                const array = variable.initializer;
                array.elements = ts.createNodeArray([
                  ...array.elements,
                  ts.createIdentifier(`${pascal}Provider`)
                ]);
              }
            }
            return ts.visitEachChild(node, visit, context);
          }
          return ts.visitNode(rootNode, visit);
        };

        const result = ts.transform(sourceFile, [transformer]);
        const transformedSourceFile = result.transformed[0];
        const printer = ts.createPrinter();
        const printed = printer.printFile(transformedSourceFile);
        fs.writeFileSync('src/store/providers.ts', printed);
      },
      {
        type: 'prettify-file',
        path: '/store/providers.ts'
      }
    ];

    return actions;
  }
};
