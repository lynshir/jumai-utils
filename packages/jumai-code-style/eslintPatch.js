const path = require('path');

/**
 * Make shareable ESLint config work under pnpm (plugins not hoisted to project root).
 * Must run before ESLint resolves plugins from this package.
 */
require('@rushstack/eslint-patch/modern-module-resolution');

function resolveFromPackage(id) {
  return require.resolve(id, { paths: [__dirname] });
}

function withResolvedParsers(config) {
  return {
    ...config,
    parser: config.parser ? resolveFromPackage(config.parser) : config.parser,
    overrides: (config.overrides || []).map((override) => ({
      ...override,
      parser: override.parser
        ? resolveFromPackage(override.parser)
        : override.parser,
    })),
  };
}

module.exports = {
  resolveFromPackage,
  withResolvedParsers,
};
