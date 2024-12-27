---
title: 带tabs上下查询方案
order: 160
toc: content
---

## 前提

- `jumai-utils版本大于等于1.2.6`

## `TabsProgramme参数`

### `normalProgramme`

- 描述: 上下查询方案 model 层实列
- 类型: [normalProgramme](./normal-programme)
- 默认值: 无

### `activeKey`

- 描述: 激活的 tabs
- 类型: string
- 默认值: 无

### `tabsToParams`

- 描述: tabs 转化成参数
- 类型: `((activeKey?: string) => Record<string, any>) | string`
- 说明: 比如 tabs 后端需要{type: "tabs 的值"}。1 将此项设置成 type 2 传个回调函数改成你想要的
- 默认值: 无

### `data`

- 描述: tabs 的数据(可以通过 setData 修改)
- 类型?: [ValueAndLabelData](./filter-base#valueandlabeldata)
- 默认值: []

### `activeKeyChangeCallback`

- 描述: tabs 改变的回调
- 类型?: (activeKey?: string, ...args: any[]) => any
- 默认值: 无

## `TabsProgramme实例属性和方法`

### `setCountMap`

- 描述: `设置tabs数量的映射,(key对应data的value,value为对应数量,目前value为null或者undefined时不显示数量)`
- 类型?: (data: Record<string, number>) => void

### `setData`

- 描述: `设置tabs数据`
- 类型?: (data: [ValueAndLabelData](./filter-base#valueandlabeldata)) => void

## 视图示例

```tsx | pure
import React from 'react';
import { NormalProgramme, TabsProgramme, TabsProgrammeComponent } from 'jumai-utils';

const normalProgramme = new NormalProgramme({
  filterItems: [
    {
      type: 'input',
      field: 'input',
      label: 'input',
    },
  ],
  handleSearch: () => {
    console.log(normalProgramme.filterItems.params);
    return Promise.resolve();
  },
});

const tabsProgramme: TabsProgramme = new TabsProgramme({
  normalProgramme,
  tabsToParams: (activeKey) => ({ a: activeKey }),
  activeKey: 'product',
  activeKeyChangeCallback: (activeKey) => {
    console.log(activeKey, 11);
  },
});

Promise.resolve().then(() => {
  tabsProgramme.setData([
    {
      value: 'product',
      label: '按商品查看',
    },
    {
      value: 'sku',
      label: '按SKU查看',
    },
  ]);
  tabsProgramme.setCountMap({
    product: 200000,
    sku: 30000000,
  });
});

export default function () {
  return <TabsProgrammeComponent tabsProgramme={tabsProgramme} />;
}
```
