#!/usr/bin/env bun
import { join } from 'path';

import { Project, SyntaxKind, type SatisfiesExpression } from 'ts-morph';

const project = new Project();
const sourceFile = project.addSourceFileAtPath(
	join(__dirname, '../server/src/service.ts')
);
const serviceDecl = sourceFile.getVariableDeclaration('service')!;
const initializer = serviceDecl.getInitializer()!;

const keys = (initializer as SatisfiesExpression)
	.getExpression()
	.asKind(SyntaxKind.ObjectLiteralExpression)!
	.getProperties()
	.filter((p) => p.isKind(SyntaxKind.PropertyAssignment))
	.map((p) => p.getName());

console.log('const RPC_HANDLES =', keys, 'as const;');
