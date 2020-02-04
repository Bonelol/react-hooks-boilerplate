import React, { useState } from 'react';
import ts, {
  ArrowFunction,
  Block,
  SourceFile,
  JsxElement
} from 'typescript';

import './index.scss';
import { modify } from '@api/todo';

const Debug = () => {
  const [input, setInput] = useState('');
  const [transformed, setTransformed] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleClick = () => {
    const sourceFile = ts.createSourceFile(
      'test.tsx',
      input,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.TSX
    );

    const ifStatement = ts.createIf(
      ts.createCall(ts.createIdentifier('canHandleNewModel'), undefined, [
        ts.createIdentifier('action')
      ]),
      ts.createBlock([
        ts.createReturn(
          ts.createCall(ts.createIdentifier('newModelReducer'), undefined, [
            ts.createIdentifier('state'),
            ts.createIdentifier('action')
          ])
        )
      ])
    );

    const importStatement = ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(undefined, ts.createIdentifier(''))
        ])
      ),
      ts.createStringLiteral('')
    );

    const imports = sourceFile.statements.filter(s => s.kind === ts.SyntaxKind.ImportDeclaration);
    const lastIndex = imports.length === 0 ? 0 : sourceFile.statements.indexOf(imports[imports.length - 1]);
    sourceFile.statements = ts.createNodeArray([
      ...sourceFile.statements.slice(0, lastIndex),
      importStatement,
      ...sourceFile.statements.slice(lastIndex)
    ]);

    const transformer = <T extends ts.Node>(
      context: ts.TransformationContext
    ) => (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        if (node.kind === ts.SyntaxKind.VariableDeclaration) {
          const variable = node as ts.VariableDeclaration;

          if (variable.name.getText() === 'reducer') {
            const arrow = variable.initializer as ArrowFunction;
            const block = arrow.body as Block;
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
    const transformedSourceFile = result.transformed[0] as SourceFile;
    const printer = ts.createPrinter();
    const printed = printer.printFile(transformedSourceFile);
    setTransformed(printed);
    console.log(printed);
  };

  const modifyApp = () => {
        const name = 'Foo';
        const pascal ='Foo';
        const camel = 'foo';
        const sourceFile = ts.createSourceFile(
          'app.tsx',
          input,
          ts.ScriptTarget.ES2015,
          true,
          ts.ScriptKind.TSX
        );

        // import NotFound from '@pages/NotFound/index';
        const importPageStatement = ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(
            undefined,
            ts.createNamedImports([
              ts.createImportSpecifier(undefined, ts.createIdentifier(pascal))
            ])
          ),
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

        const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
          function visit(node: ts.Node): ts.Node {
            // Switch tag
            if (
              node.kind === ts.SyntaxKind.JsxElement &&
              (node as JsxElement).openingElement &&
              (node as JsxElement).openingElement.tagName.getText() === 'Switch'
            ) {
              const newLine = ts.createJsxText('\n ');
              const page = ts.createJsxSelfClosingElement(
                ts.createIdentifier(''),
                undefined,
                ts.createJsxAttributes([
                  ts.createJsxAttribute(ts.createIdentifier('path'), ts.createStringLiteral(`/${camel}`)),
                  ts.createJsxAttribute(ts.createIdentifier('component'), ts.createJsxExpression(undefined, ts.createIdentifier(pascal)))
                ])
              );
              (node as JsxElement).children = ts.createNodeArray([
                ...(node as JsxElement).children.slice(0, 2),
                newLine,
                page,
                ...(node as JsxElement).children.slice(2)
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
        // const printed = printer.printFile(transformedSourceFile);
        // fs.writeFileSync('src/app.tsx', printed);
  };

  return (
    <div className="debug">
      <div>
        <div>
          <textarea value={input} onChange={handleChange}></textarea>
          <textarea value={transformed}></textarea>
        </div>
        <button onClick={handleClick}>Parse</button>
        <button onClick={modifyApp}>Modify App</button>
      </div>
    </div>
  );
};

export default Debug;
