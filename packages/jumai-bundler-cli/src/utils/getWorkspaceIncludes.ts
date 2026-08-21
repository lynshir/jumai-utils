import fs from 'fs';
import path from 'path';
import type { UserConfig } from '../types';

const WORKSPACE_PACKAGES = [
  'jumai-common',
  'jumai-utils',
  'jumai-base',
  'jumai-data-grid',
];

export function getWorkspaceSourceAliases(cwd: string): Record<string, string> {
  const aliases: Record<string, string> = {};

  WORKSPACE_PACKAGES.forEach((name) => {
    try {
      const pkgRoot = path.dirname(require.resolve(`${name}/package.json`, { paths: [cwd] }));
      const srcDir = path.join(pkgRoot, 'src');

      if (fs.existsSync(srcDir)) {
        aliases[name] = srcDir;
      }
    } catch {
      //
    }
  });

  return aliases;
}

export function getWorkspaceIncludes(
  cwd: string,
  extraJsModuleIncludes?: UserConfig['extraJsModuleIncludes'],
): Array<string | RegExp> {
  const includes: Array<string | RegExp> = [];

  WORKSPACE_PACKAGES.forEach((name) => {
    try {
      const pkgRoot = path.dirname(require.resolve(`${name}/package.json`, { paths: [cwd] }));
      includes.push(path.join(pkgRoot, 'src'));
      includes.push(path.join(pkgRoot, 'dist'));
    } catch {
      //
    }
  });

  extraJsModuleIncludes?.forEach((item) => {
    if (item instanceof RegExp) {
      includes.push(item);
      return;
    }

    if (path.isAbsolute(item)) {
      includes.push(item);
      return;
    }

    if (item.endsWith('./')) {
      includes.push(path.resolve(cwd, item));
      return;
    }

    includes.push(path.dirname(require.resolve(item, { paths: [cwd] })));
  });

  return includes;
}
