import type { RsbuildConfig } from '@rsbuild/core';

const FRAMEWORK_BUNDLES = [
  'react-dom',
  'react',
  'redux',
  'react-redux',
  'mobx',
  'mobx-react',
  'history',
  'react-router',
  'react-router-dom',
];

const minSize = 1024 * 20;

function isModuleCSS(module: { type?: string; }) {
  return (
    module.type === 'css/mini-extract' ||
    module.type === 'css/extract-chunks' ||
    module.type === 'css/extract-css-chunks'
  );
}

export function getGranularSplitChunks(): NonNullable<RsbuildConfig['splitChunks']> {
  let id = 0;

  return {
    preset: 'none',
    chunks: 'all',
    cacheGroups: {
      default: false,
      defaultVendors: false,
      framework: {
        name: 'framework',
        test: new RegExp(
          `[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join('|')})[\\\\/]`
        ),
        chunks: 'all',
        minChunks: 1,
        priority: 40,
        enforce: true,
      },
      lib: {
        test(module: any) {
          return (
            !isModuleCSS(module) &&
            module.size() > minSize &&
            /node_modules[/\\]/.test(module.identifier())
          );
        },
        name(module: any) {
          const rawRequest =
            module.rawRequest &&
            module.rawRequest.replace(/^@(\w+)[/\\]/, '$1-');
          if (rawRequest) {
            return `${rawRequest.replace(/\./g, '_')
              .replace(/\//g, '-')}-lib`;
          }

          const identifier = module.identifier();
          const trimmedIdentifier = /(?:^|[/\\])node_modules[/\\](.*)/.exec(
            identifier
          );
          const processedIdentifier =
            trimmedIdentifier &&
            trimmedIdentifier[1].replace(/^@(\w+)[/\\]/, '$1-');

          return `${processedIdentifier || identifier}-lib`;
        },
        minSize,
        priority: 30,
        reuseExistingChunk: true,
        chunks: 'all',
        minChunks: 1,
      },
      shared: {
        name: () => `shared-${++id}`,
        minSize,
        priority: 10,
        reuseExistingChunk: true,
        chunks: 'all',
        minChunks: 2,
      },
    },
  };
}
