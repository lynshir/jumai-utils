const { withResolvedParsers } = require('./eslintPatch');

module.exports = withResolvedParsers(require('./dist/eslintNode').eslintNode);
