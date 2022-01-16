import * as ts from 'typescript'
import { readFile } from 'fs/promises'
import { getAllFiles } from './file'
const fs = require('fs')
const path = require('path')


const TYPE_MODULE = 'type';
const REQUEST_MAPPING = 'RequestMapping';
const MethodStrMapping = {
    'PostMapping': 'post',
    'GetMapping': 'get'
};

let typeOptions = '';
let rootPath = '';
let methods = [];

(async function main() {
    const ControllerPath = '../Controller';
    const cpath = path.join(__dirname, ControllerPath);
    const filesList = [];
    await getAllFiles(cpath, filesList)

    filesList.forEach(async (filePath) => {
        typeOptions = '';
        rootPath = '';
        methods = [];


        const ori = await readFile(filePath + '.ts');
        const oriCode = ori.toString();
        const sourceFile = ts.createSourceFile(filePath, oriCode, 99, true, 3);

        sourceFile.statements.forEach(statement => {
            switch (statement.kind) {
                case ts.SyntaxKind.ImportDeclaration:
                    handleImportDeclaration(statement as (ts.ImportDeclaration));
                    break;
                case ts.SyntaxKind.ClassDeclaration:
                    handleClassDeclaration(statement as (ts.ClassDeclaration));
                    break;
            }
        })

        const code = generateCode(typeOptions, rootPath, methods);
        let file = path.resolve(path.join(__dirname, '../../../frontend/src/api'), './test.ts');
        fs.writeFile(file, code, { encoding: 'utf8' }, err => { })
    })
})()

function handleImportDeclaration(statement: ts.ImportDeclaration) {
    const module = statement.moduleSpecifier.getText().slice(1, -1);
    if (module !== TYPE_MODULE) return;


    typeOptions = statement.getText();
}

function handleClassDeclaration(statement: ts.ClassDeclaration) {
    statement.decorators.forEach(decorator => handleClassDecorator(decorator));

    statement.members.forEach(member => {
        if (member.kind === 167) {
            handleMethodDeclaration((member as ts.MethodDeclaration), methods)
        }
    })
}

function handleClassDecorator({ expression }: ts.Decorator) {
    if (expression.kind !== ts.SyntaxKind.CallExpression) return;
    const Ex = (expression as ts.CallExpression);
    
    if ((Ex.expression as ts.Identifier).escapedText !== REQUEST_MAPPING) return;
    rootPath = Ex.arguments[0].getText().slice(1, -1);
}


function handleMethodDeclaration(statement: ts.MethodDeclaration, methods: Array<any>) {
    const obj = {
        method: '',
        path: '',
        name: '',
        params: [],
        returnType: '',
    };

    statement.decorators.forEach(decorator => handleMethodDecorator(decorator, obj))

    obj.name = statement.name.getText()

    statement.parameters.forEach(param => handleMethodParameter(param, obj.params));

    obj.returnType = statement.type.getText();

    methods.push(obj);
}

function handleMethodDecorator({ expression }: ts.Decorator, obj: any) {
    if (expression.kind !== ts.SyntaxKind.CallExpression) return;

    const Ex = (expression as ts.CallExpression);

    const methodStr = Ex.expression.getText();
    obj.method = MethodStrMapping[methodStr];
    obj.path = Ex.arguments[0].getText().slice(1, -1);
}

function handleMethodParameter(param: ts.ParameterDeclaration, arr: Array<any>) {
    const obj = {
        name: '',
        type: '',
        kind: '',
    };

    obj.name = param.name.getText();
    obj.type = param.type.getText();
    obj.kind = param.decorators[0].expression.getText();

    arr.push(obj);
}

function generateCode(importStr: string, rootPath: string, methods: any[]) {

    const methodStr = [];

    methods.forEach((method) => {

        const paramStr = [];
        let body = null;
        let params = null;

        method.params.forEach(param => {
            if (param.kind === 'RequestBody') {
                body = param;
            }
            else if (param.kind === 'RequestParam') {
                params = param;
            }
            paramStr.push(`${param.name}: ${param.type}`);
        });

        methodStr.push(
`export async function ${method.name}(${paramStr.join(', ')}):${method.returnType}{
    return axios.request({
        method: '${method.method}',
        url: '${rootPath + method.path}',
        ${params ? `params: ${params.name},` : '/* params */'}
        ${body ? `data: ${body.name},` : '/* body */'}
    });
}`)
    });

    return `${importStr}\nimport axios from '../utils/axios'\n\n${methodStr.join('\n\n')}`;
}

