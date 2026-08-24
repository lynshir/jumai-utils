import path from 'path';
import { STYLE_EXTENSIONS } from '../constants';

const CSS_MODULE_FILE_PATTERN = new RegExp(
  `\\.module\\.(${STYLE_EXTENSIONS.join('|')})(\\?.*)?$`,
);

export function createAutoCSSModulesRule(srcDir: string) {
  const normalizedSrcDir = path.resolve(srcDir);

  return (resourcePath: string) => {
    const normalizedResourcePath = resourcePath.split('?')[0];

    // *.module.* 无论在何处（含 node_modules 中已发布组件库的 dist）都应启用 CSS Modules
    if (CSS_MODULE_FILE_PATTERN.test(normalizedResourcePath)) {
      return true;
    }

    if (normalizedResourcePath.includes('node_modules')) {
      return false;
    }

    if (STYLE_EXTENSIONS.some((ext) => normalizedResourcePath.endsWith(`global.${ext}`))) {
      return false;
    }

    const normalizedPath = path.resolve(normalizedResourcePath);
    if (!normalizedPath.startsWith(normalizedSrcDir)) {
      return false;
    }

    return STYLE_EXTENSIONS.some((ext) => normalizedResourcePath.endsWith(`.${ext}`));
  };
}
