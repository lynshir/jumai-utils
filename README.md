## [组件库文档](http://192.168.200.143:11112)

## css module 说明

- jumai-common 和 jumai-utils 调整为 bundles 打包对 css module 有影响
- 理论上组件库就不应该开启 css module,但是兼容原来,后面再调整
- jumai-common 和 jumai-utils 需要开启 css module,需要样式文件加 module 后缀

## 组件库核心技术说明

### [dumi](https://d.umijs.org/)

- 文档编写工具
- pnpm run docs:start 文档预览
- pnpm run docs:build 文档打包

### [pnpm + workspace](https://www.pnpm.cn/)

- pnpm 包下载工具结合 workspace 功能替换原来的 lerna bootstrap

### [turbo](https://turbo.build/)

- 一个打包系统,用来管理我们项目内部 build 及 test 等
- 主要用到 2 个特性: 并行构建、缓存 build 及 test
- pnpm run run-build 执行 workspace 内所有项目中在 package.json 的 scripts 中定义的 build 脚本
- pnpm run run-test 执行 workspace 内所有项目中在 package.json 的 scripts 中定义的 test 脚本

### [vitest](https://cn.vitest.dev/config/)

- 一个测试工具,用于替换原先的 jest(配置繁琐且复杂,而且速度偏慢)

### [father4](https://www.npmjs.com/package/father)

- 包打包工具,主要涉及项目 jumai-base、jumai-sentry、egenie-vite-config、jumai-common、jumai-utils

## 下载流程

### 设置淘宝源

```shell
pnpm config set registry https://registry.npmmirror.com
npm config set registry https://registry.npmmirror.com
```

### 下载

```shell
pnpm install
```

## 发布流程

### 设置 npm 源

```shell
npm config set registry https://registry.npmjs.org/
```

### 发布

- 中间会有一个要发布版本的提示,输入想要发布的版本即可

```shell
npm run release
```
