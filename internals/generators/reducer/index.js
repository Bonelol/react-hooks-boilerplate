/**
 * Reducer Generator
 */
const fs = require('fs');
const ts = require('typescript');
const { pascalCase, camelCase } = require('change-case');
const reducerExists = require('../utils/reducerExists');

module.exports = {
  description: 'Generate new reducer',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Reducer name?',
      default: 'Todo',
      validate: value => {
        if (/.+/.test(value)) {
          return reducerExists(value)
            ? 'A reducer this name already exists'
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
        path: '../../src/store/types/{{camelCase name}}.ts',
        templateFile: './reducer/type.ts.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/store/actions/{{camelCase name}}Actions.ts',
        templateFile: './reducer/action.ts.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/store/reducers/{{camelCase name}}Reducer.ts',
        templateFile: './reducer/reducer.ts.hbs',
        abortOnFail: true
      },
      function modifyReducers() {
        const name = data.name;
        const pascal = pascalCase(name);
        const camel = camelCase(name);
        const file = fs.readFileSync('src/store/reducers.ts', 'utf8');
        const sourceFile = ts.createSourceFile(
          'reducers.ts',
          file,
          ts.ScriptTarget.ES2015,
          true,
          ts.ScriptKind.TSX
        );

        const importStatement = ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(
            undefined,
            ts.createNamedImports([
              ts.createImportSpecifier(
                undefined,
                ts.createIdentifier(`canHandle${pascal}`)
              ),
              ts.createImportSpecifier(
                undefined,
                ts.createIdentifier(`${camel}Reducer`)
              )
            ])
          ),
          ts.createStringLiteral(`./reducers/${camel}Reducer`)
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
          importStatement,
          ...sourceFile.statements.slice(lastIndex + 1)
        ]);

        const ifStatement = ts.createIf(
          ts.createCall(ts.createIdentifier(`canHandle${pascal}`), undefined, [
            ts.createIdentifier('action')
          ]),
          ts.createBlock([
            ts.createReturn(
              ts.createCall(ts.createIdentifier(`${camel}Reducer`), undefined, [
                ts.createIdentifier('state'),
                ts.createIdentifier('action')
              ])
            )
          ])
        );

        const transformer = context => rootNode => {
          function visit(node) {
            if (node.kind === ts.SyntaxKind.VariableDeclaration) {
              const variable = node;

              if (variable.name.getText() === 'reducer') {
                const arrow = variable.initializer;
                const block = arrow.body;
                block.statements = ts.createNodeArray([
                  ...block.statements.slice(0, block.statements.length - 1),
                  ifStatement,
                  block.statements[block.statements.length - 1]
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
        fs.writeFileSync('src/store/reducers.ts', printed);
      },
      function modifyTypes() {
        const name = data.name;
        const pascal = pascalCase(name);
        const camel = camelCase(name);
        const file = fs.readFileSync('src/store/types.ts', 'utf8');
        const sourceFile = ts.createSourceFile(
          'types.ts',
          file,
          ts.ScriptTarget.ES2015,
          true,
          ts.ScriptKind.TSX
        );

        const importTypeStatement = ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(
            undefined,
            ts.createNamedImports([
              ts.createImportSpecifier(undefined, ts.createIdentifier(pascal))
            ])
          ),
          ts.createStringLiteral(`./types/${camel}`)
        );
        const importActionsStatement = ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(
            undefined,
            ts.createNamedImports([
              ts.createImportSpecifier(
                undefined,
                ts.createIdentifier(`${camel}Actions`)
              )
            ])
          ),
          ts.createStringLiteral(`@store/actions/${camel}Actions`)
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
          importTypeStatement,
          importActionsStatement,
          ...sourceFile.statements.slice(lastIndex + 1)
        ]);

        const action = sourceFile.statements.find(
          s =>
            s.kind === ts.SyntaxKind.TypeAliasDeclaration &&
            s.name.text === 'Action'
        );

        if (action.type.kind === ts.SyntaxKind.TypeReference) {
          action.type = ts.createUnionTypeNode([
            action.type,
            ts.createIdentifier(`${camel}Actions`)
          ]);
        } else if (action.type.kind === ts.SyntaxKind.UnionType) {
          action.type = ts.createUnionTypeNode([
            ...action.type.types,
            ts.createIdentifier(`${camel}Actions`)
          ]);
        }

        const state = sourceFile.statements.find(
          s =>
            s.kind === ts.SyntaxKind.InterfaceDeclaration &&
            s.name.text === 'State'
        );

        state.members.push(
          ts.createPropertySignature(
            undefined,
            `${camel}Store`,
            undefined,
            ts.createArrayTypeNode(ts.createTypeReferenceNode(`${pascal}`))
          )
        );

        const printer = ts.createPrinter();
        const printed = printer.printFile(sourceFile);
        fs.writeFileSync('src/store/types.ts', printed);
      },
      {
        type: 'prettify-file',
        path: '/store/reducers.ts'
      },
      {
        type: 'prettify-file',
        path: '/store/types.ts'
      }
    ];

    return actions;
  }
};
