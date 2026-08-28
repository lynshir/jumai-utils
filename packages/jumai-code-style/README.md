# jumai-code-style

共享 ESLint / Stylelint / Commitlint / Prettier 配置。

## pnpm 使用说明

pnpm 默认不会提升 ESLint 插件到项目根目录，会导致 **VS Code / Cursor ESLint 扩展** 无法解析插件（红线、保存自动修复失效）。CLI 用 `extends: require.resolve(...)` 时通常仍可用。

### 业务项目必须配置

**1. `.npmrc`**

```ini
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=@typescript-eslint/*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*stylelint*
```

**2. `.eslintrc.js`**

```js
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: require.resolve('jumai-code-style/eslintReact'),
  rules: {},
};
```

`@rushstack/eslint-patch` 已内置于本包的 `eslintReact.js` / `eslintNode.js`；业务项目顶部再 require 一次也安全。若使用较旧版本本包，请自行安装：

```bash
pnpm add -D @rushstack/eslint-patch
```

**3. peer 依赖（业务项目显式安装）**

```bash
pnpm add -D eslint@7.29.0 prettier@2.2.1 stylelint@13.13.1 \
  husky lint-staged @commitlint/cli validate-commit-msg
```

**4. 编辑器（推荐）**

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

## 关于依赖升级

当前刻意锁定：

| 包 | 版本 | 说明 |
|----|------|------|
| eslint | 7.29.0 | 已 deprecated，但升到 8/9 需同步改 typescript-eslint、babel-eslint→@babel/eslint-parser、配置格式，全业务线 breaking |
| stylelint | 13.x | 升 14/15 规则与插件 peer 大变 |
| validate-commit-msg | 2.x | 已 deprecated，功能与 commitlint 重复，后续可移除而非升级 |
| husky | >=9 | 已支持 pnpm |

在未统一规划前，**不要单独升级 eslint / stylelint 大版本**。
