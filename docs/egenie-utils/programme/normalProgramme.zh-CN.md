---
title: 上下查询方案
order: 150
toc: content
---

## `NormalProgramme参数`

### `moduleName`

- 描述: `查询方案标识。必须唯一,不能和其他查询方案重复。建议用路由的路径`
- 描述: `目前主要用于方案显隐。传入则开启否则不开启`
- 类型?: string
- 默认值: 无

### `filterItems`

- 描述: 查询项配置
- 类型?: [FilterItemOptions](./filter-base#filteritemoptions)[]
- 默认值: []

### `dict`

- 描述: 字典
- 类型?: { [key: string]: [ValueAndLabelData](./filter-base#valueandlabeldata) }
- 默认值: {}

### `handleSearch`

- 描述: 回车、查询回调
- 类型?: (...args: any) => Promise\<any>
- 默认值: 无

### `count`

- 描述: 一行显示个数
- 类型?: number
- 默认值: `4`

### `button`

- 描述: 自定义的 button。会覆盖默认的重置、查询
- 类型?: React.ReactNode
- 默认值: null

### `showButton`

- 描述: 是否显示 button
- 类型?: boolean
- 默认值: true

### `showCollapse`

- 前提: `egenie-common和egenie-utils版本大于等于0.14.0`
- 描述: 当查询项数量多余 2 行是否显示折叠
- 注意: `如果用此组件来竖直布局(竖直方向一行显示一个)不需要开启折叠`
- 类型?: boolean
- 默认值: true

## `NormalProgramme实例属性和方法`

### `filterItems`

- 描述: `FilterItems的instance`
- 类型: [FilterItems](./filter-items#实例属性和方法)
- 默认值: 无

## 视图层示例

```tsx | pure
import { Card } from 'antd';
import { NormalProgramme, NormalProgrammeComponent } from 'egenie-utils';
import React from 'react';

const normalProgramme = new NormalProgramme({
  filterItems: [],
  handleSearch: () => Promise.resolve(),
  count: 6,
});

// 外层布局请自写。一般用antd的Card
<Card size="small">
  <NormalProgrammeComponent store={normalProgramme} />
</Card>;
```
