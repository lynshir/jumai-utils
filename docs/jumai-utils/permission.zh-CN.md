---
title: 主表按钮及权限
order: 4
toc: content
---

## 主表按钮配置项

```ts
interface IButton {
  /** 按钮名称 */
  text: string | string[];

  /** 按钮权限ID 不传默认展示 传错按钮隐藏 */
  permissionId?: string; // 必填

  /** 按钮点击事件 */
  handleClick?: (event: ReactEventHandler) => void;

  /** 按钮图标 */
  icon?: string;

  /** 按钮ID  在group里使用 */
  idx?: string | number;

  /** 按钮显隐 暂时没用 */
  display?: (rows?) => boolean;

  /** 按钮组配置 */
  group?: IButton[];

  /** 按钮样式 */
  style?: CSSProperties;

  /** 按钮类型  dropdown为下拉菜单 按钮  */
  type?: string;

  /** 按钮组是否隐藏（整组按钮都没有权限时使用,不需要外部传参） */
  isHide?: boolean;
}
```

## 主表按钮权限配置

主表按钮权限配置方式支持两种

1. 配置 pageId 和 permissionId
   > 示例：

```js
public grid: IMainSubStructureModel = {
  pageId: '407',
  button: [
    {
      permissionId: '6',
      text: '按钮名称',
      ...
    },
    {
      permissionId: ['6','21'],
      text: '按钮名称',
      ...
    }
  ]
}
```

2. 直接将 pageId 和 permissionId 通过下划线拼接，不需要单独配置 pageId
   > 示例：

```js
public grid: IMainSubStructureModel = {
  button: [
    {
      permissionId: '407_6',
      text: '按钮名称',
      ...
    },
    {
      permissionId: ['407_6', '407_21'],
      text: '按钮名称',
      ...
    }
  ]
}
```

## 主表按钮类型

根据设计稿，主表按钮样式有三种

1. 普通按钮

> 示例：

```js
public grid: IMainSubStructureModel = {
  button: [
    {
      permissionId: '407_6',
      text: '按钮名称',
      ...
    }
  ]
}
```

2. 含功能-下拉菜单

> 示例：

```js
public grid: IMainSubStructureModel = {
  button: [
    {
      permissionId: '407_6',
      text: '按钮名称',
      ...
      group: [
        {
          permissionId: '407_6',
          text: '按钮名称',
          ...
        }
      ]
    }
  ]
}
```

3. 下拉菜单

> 示例：

```js
public grid: IMainSubStructureModel = {
  button: [
    {
      permissionId: '407_6',
      text: '按钮名称',
      type: 'dropdown',
      ...
      group: [
        {
          permissionId: '407_6',
          text: '按钮名称',
          ...
        }
      ]
    }
  ]
}
```

## 主表按钮行额外位置配置

主表增加配置项

```ts
export interface IMainSubStructureModel {
  btnExtraLeft?: IBtnExtraLeft;
  btnExtraRight?: ReactNode;
  ...
}
```

btnExtraRight 是自定义样式  
btnExtraLeft 为固定样式

> 参数说明

```ts
export interface IBtnExtraLeft {
  /** 警告icon */
  isWarnIcon: boolean;

  /** 文字说明 */
  text: ReactNode;

  /** 按钮 */
  linkBtnText?: string;

  /** 按钮点击事件 */
  handleLinkBtnClick?: (event: ReactEventHandler) => void;
}
```

> 示例：

```js
public grid: IMainSubStructureModel = {
  ...
  btnExtraLeft: {
    isWarnIcon: true,
    text: '警告信息',
    linkBtnText: '按钮名称',
    handleLinkBtnClick: () => {
      console.log('这里是一个按钮');
    }
  },
  btnExtraRight: <Text testValue='testValue'>
}
```

- `详细展示样式见蓝湖-PC产品设计规范-列表页-列表/查询列表/上下结构`

## 其他区域权限

页面上所有需要配置权限的区域均可使用此组件

> 参数说明

```ts
export interface IPermission {
  permissionId: string;
  children?: ReactNode;
}
```

> 示例

```js
import { Permission } from 'jumai-utils';
const TestPermission = () => {
  return <Permission permissionId="201_44">这里是内容区域 ...</Permission>;
};
```
