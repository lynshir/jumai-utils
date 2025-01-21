---
title: 表格配置
order: 1
toc: content
---

## `MainSubStructureModel`

- 描述: 使用左右及上下查询方案时的表格配置

### `buttons`

- 描述: 按钮配置
- 类型: [IButton](../permission#主表按钮配置项)[]
- 默认值: []

### `hiddenSubTable`

- 描述: 是否显示子表
- 类型: Boolean
- 默认值:

### `btnExtraLeft`

- 描述: 主表 button 左侧警告提示，跟在按钮后面
- 类型?: [BtnExtraLeft](./ieg-grid-types#BtnExtraLeft)[]
- 默认值:

### `btnExtraRight`

- 描述: 主表 button 右侧信息展示，位置在按钮最后一行右侧
- 类型: ReactNode

### `pageId`

- 描述: 页面 pageId,请求按钮权限使用
- 类型: String

### `collectData`

- 描述: 按钮上方的数据汇总行
- 类型?: [CollectData](./ieg-grid-types#CollectData)[]
- 默认值:[]

### `grid`

- 描述: 表格配置，当使用
- 类型: [IEgGridModel](./ieg-grid-model#columns)
- 默认值: {}

### `api`

- 描述: 外放出来的一些回调方法
- 类型: [IEgGridApi](./ieg-grid-api#onRowClick)
- 默认值: {}

### `subTables`

- 描述: 子表配置，hiddenSubTable 为 true 时生效
- 类型: `{}`
- 默认值: {}

## MainSubStructure 的 props

### `store`

- 描述: 方案 store
- 类型: `MainSubStructureModel`

```ts
import { MainSubStructureModel, MainSubStructure } from 'jumai-utils';
import React from 'react';

interface MainItem {
  id: number;
}

export class Store {
  public mainSubStructureModel = new MainSubStructureModel({
    buttons: [],
    grid: {
      columns: [],
      rows: [],
      primaryKeyField: 'id',
      sortByLocal: false,
      showCheckBox: true,
      showEmpty: true,
      pageSize: 200,
    },
    hiddenSubTable: true,

    // 主表查询api
    api: {
      onQuery: (params) => {
        const { filterParams = {}, ...rest } = params;
        return request<PaginationData<MainItem>>({
          url: 'url',
          method: 'POST',
          data: {
            ...filterParams,
            ...rest,
          },
        });
      },
    },
  });
}

const store = new Store();

export default function () {
  return <MainSubStructure store={store.mainSubStructureModel} />;
}
```

## `EgGridModel`

- 描述: 纯表格
- 类型: [IEgGridModel](./ieg-grid-model#columns)
- 默认值: {}
