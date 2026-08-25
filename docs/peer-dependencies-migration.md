# peerDependencies 变更清单

> 背景：业务项目从 Yarn 1 迁移到 pnpm 后，pnpm 严格隔离依赖，不再允许「幽灵依赖」。  
> 组件库 dist 中 `import` 但未声明在 `dependencies` / `peerDependencies` 的包，会导致消费方构建失败。  
> 扫描脚本：`node scripts/scan-peer-deps.mjs`（基于各包 `src/` 静态分析）

---

## 变更原则

| 类型 | 处理方式 |
|------|----------|
| React 组件库运行时 import 的包 | 加入 `peerDependencies`（由业务项目提供） |
| 组件库自身打包产物（如 `jumai-base` 纯工具） | 无外部运行时依赖，无需变更 |
| 已正确放在 `dependencies` 的包 | 保持不变（如 `jumai-utils` 的 `react-dnd`） |
| 只在 `devDependencies` 中、dist 却引用的包 | **必须**移到 `peerDependencies` |
| CLI / 构建工具（bundler-cli、tool-cli 等） | 不纳入本次变更（Node 内置模块无需声明） |

**版本对齐基准**（与业务项目 `jumai-ts-oms` 及 monorepo devDeps 一致）：

```
react: 17.0.1
react-dom: 17.0.1
antd: 4.24.7
@ant-design/icons: 4.7.0
moment: 2.29.2
axios: 0.28.0
lodash: 4.17.21
mobx: 5.15.7
mobx-react: 6.3.1
react-router-dom: 5.2.0
history: 4.9.0        ← react-router-dom@5 配套
qs: 6.11.2
```

---

## 1. jumai-common（**必须变更，优先级 P0**）

### 现状

```json
"peerDependencies": {
  "antd": "4.24.7",
  "moment": "2.29.2"
}
```

dist 中实际 import 但仅存在于 `devDependencies` 的包：

| 包 | 引用位置示例 | 现状 |
|----|-------------|------|
| `@ant-design/icons` | `src/importModal/importModal.tsx` | devDependencies |
| `axios` | `src/request.ts`, `src/print/utils.ts` | devDependencies |
| `lodash` | `src/print/utils.ts` | 未声明 |
| `mobx` | `src/permission.tsx` | devDependencies |
| `mobx-react` | 多处组件 | devDependencies |
| `react` / `react-dom` | 全部组件 | devDependencies |
| `react-router-dom` | `src/renderRoutes.tsx` | devDependencies |
| `history` | `src/history.ts` | 未声明（仅有 `@types/history` 在 dependencies） |

### 建议变更

```json
"peerDependencies": {
  "antd": "4.24.7",
  "moment": "2.29.2",
  "@ant-design/icons": "4.7.0",
  "axios": "0.28.0",
  "history": "4.9.0",
  "lodash": "4.17.21",
  "mobx": "5.15.7",
  "mobx-react": "6.3.1",
  "react": "17.0.1",
  "react-dom": "17.0.1",
  "react-router-dom": "5.2.0"
}
```

### devDependencies 调整

以下包保留在 devDependencies（monorepo 本地开发 / 测试用），**无需移除**：

```
@ant-design/icons, antd, axios, mobx, mobx-react, moment,
react, react-dom, react-router-dom, qrcode（仅测试）
```

新增 devDependency（若本地开发缺 history）：

```json
"history": "4.9.0"
```

### dependencies 调整

`@types/history` 可保留；考虑新增 `"history": "4.9.0"` 到 devDependencies 而非 dependencies（history 应作为 peer 由消费方提供）。

---

## 2. jumai-utils（**必须变更，优先级 P0**）

### 现状

```json
"peerDependencies": {
  "antd": "4.24.7",
  "moment": "2.29.2"
}
```

dist 中实际 import 但仅存在于 `devDependencies` 的包：

| 包 | 引用位置示例 | 现状 |
|----|-------------|------|
| `@ant-design/icons` | `src/fullModal/fullModal.tsx` 等 5 处 | 未声明 |
| `lodash` | `src/programme/**` | devDependencies |
| `mobx` / `mobx-react` | 大量组件 | devDependencies |
| `qs` | programme 相关 | devDependencies |
| `react` / `react-dom` | 全部组件 | devDependencies |

已在 `dependencies` 中、无需改为 peer 的包：

```
classnames, react-copy-to-clipboard, react-dnd,
react-dnd-html5-backend, react-sortable-hoc, rc-resize-observer,
jumai-data-grid, egenie-monitor-web
```

### 建议变更

```json
"peerDependencies": {
  "antd": "4.24.7",
  "moment": "2.29.2",
  "@ant-design/icons": "4.7.0",
  "lodash": "4.17.21",
  "mobx": "5.15.7",
  "mobx-react": "6.3.1",
  "qs": "6.11.2",
  "react": "17.0.1",
  "react-dom": "17.0.1"
}
```

---

## 3. jumai-data-grid（**可选变更，优先级 P2**）

### 现状

```json
"peerDependencies": {
  "react": "^16.14 || ^17.0",
  "react-dom": "^16.14 || ^17.0"
}
```

源码 import 了 `@linaria/core`，但该包通过 Rollup 打入 `lib/bundle.js`，**发布产物不 external 此依赖**。pnpm 消费方通常无问题。

### 建议

- **暂不变更** peerDependencies
- 若后续改为 external 打包，再补充：`"@linaria/core": "^3.0.0-beta.4"`

---

## 4. jumai-base（**无需变更**）

纯工具函数，无 React / 第三方运行时 import（`vitest` 仅测试文件使用）。

---

## 5. 无需变更的包

| 包 | 原因 |
|----|------|
| `jumai-bundler-cli` | CLI 工具，dependencies 已完整声明 |
| `jumai-babel-preset` | Babel preset，无运行时 peer |
| `jumai-postcss-preset` | PostCSS preset，dependencies 已完整 |
| `jumai-code-style` | 仅 ESLint/Stylelint 配置 |
| `jumai-config` | 构建配置 |
| `jumai-tool-cli` | CLI 工具 |
| `generator-jumai-react-web` | Yeoman generator |
| `generator-jumai-react-h5` | Yeoman generator |
| `jumai-demo` | 私有 demo，不发布 |

---

## 6. 业务项目侧配套变更

发布新版 `jumai-common` / `jumai-utils` 后，各业务项目 `package.json` 需确保已声明全部 peer 包。

以 `jumai-ts-oms` 为基准，**业务项目 dependencies 检查清单**：

| 包 | jumai-ts-oms 是否已声明 | 说明 |
|----|------------------------|------|
| `@ant-design/icons` | ✅ 已补充 4.7.0 | pnpm 迁移关键修复 |
| `antd` | ✅ | |
| `axios` | ✅ | jumai-common peer |
| `lodash` | ✅ | jumai-common/utils peer |
| `mobx` / `mobx-react` | ✅ | |
| `moment` | ✅ | |
| `react` / `react-dom` | ✅ | |
| `react-router-dom` | ✅ | jumai-common peer |
| `history` | ⚠️ 未直接声明 | 通过 `react-router-dom` 间接安装，pnpm 下通常可用；若报错需显式添加 `history@4.9.0` |
| `qs` | ✅ | jumai-utils peer |

---

## 7. 发版与迁移步骤

```
1. jumai-utils monorepo 按上文修 peerDependencies
2. 本地 pnpm build 各包，确认 dist 正常
3. 发版 jumai-common@3.0.2、jumai-utils@3.0.2（patch 版本）
4. 各业务项目：
   a. pnpm add @ant-design/icons@4.7.0（若尚未添加）
   b. pnpm update jumai-common jumai-utils
   c. rm -rf node_modules && pnpm install
   d. pnpm run dev-rsbuild 验证
```

---

## 8. 附录：jumai-import-export

该包（v1.0.7）不在本 monorepo 内，若业务项目使用后 pnpm 报缺失依赖，需单独排查其 `package.json` 并做同样处理。
