const { withResolvedParsers } = require('./eslintPatch');

module.exports = withResolvedParsers(require('./dist/eslintReact').eslintReact);
