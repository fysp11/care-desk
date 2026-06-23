import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const apiSourceRoot = new URL('../src', import.meta.url);
const decoratorNames = [
  'Body',
  'Controller',
  'Delete',
  'Get',
  'HttpCode',
  'Injectable',
  'IsEmail',
  'IsString',
  'MinLength',
  'Module',
  'Param',
  'Post',
  'Put',
  'Query',
  'UseGuards',
] as const;

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'generated' ? [] : sourceFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.ts') ? [entryPath] : [];
  });

describe('NestJS decorator style', () => {
  test('uses declaration-site decorators instead of manual metadata plumbing', () => {
    const violations = sourceFiles(apiSourceRoot.pathname).flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      const relativeFile = relative(apiSourceRoot.pathname, file);
      const lines = source.split('\n');

      return lines.flatMap((line, index) => {
        const trimmed = line.trimStart();
        const lineNumber = index + 1;

        if (trimmed.startsWith('Reflect.defineMetadata(')) {
          return [`${relativeFile}:${lineNumber} Reflect.defineMetadata`];
        }

        const decorator = decoratorNames.find((name) =>
          trimmed.startsWith(`${name}(`),
        );

        return decorator
          ? [`${relativeFile}:${lineNumber} manual ${decorator} invocation`]
          : [];
      });
    });

    expect(violations).toEqual([]);
  });
});
