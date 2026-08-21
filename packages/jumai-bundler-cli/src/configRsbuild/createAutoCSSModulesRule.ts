import path from 'path';
import { STYLE_EXTENSIONS } from '../constants';

export function createAutoCSSModulesRule(srcDir: string) {
  const normalizedSrcDir = path.resolve(srcDir);

  return (resourcePath: string) => {
    if (resourcePath.includes('node_modules')) {
      return false;
    }

    if (STYLE_EXTENSIONS.some((ext) => resourcePath.endsWith(`global.${ext}`))) {
      return false;
    }

    if (STYLE_EXTENSIONS.some((ext) => resourcePath.endsWith(`module.${ext}`))) {
      return true;
    }

    const normalizedPath = path.resolve(resourcePath);
    if (!normalizedPath.startsWith(normalizedSrcDir)) {
      return false;
    }

    return STYLE_EXTENSIONS.some((ext) => resourcePath.endsWith(`.${ext}`));
  };
}
