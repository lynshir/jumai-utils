---
title: 左右查询方案
order: 170
toc: content
---

## Programme`参数`

### `filterItems`

- 描述: 查询项配置
- 类型?: [FilterItemOptions](./filter-base#filteritemoptions)[]
- 默认值: []

### `dict`

- 描述: 字典
- 类型?: { [key: string]: [ValueAndLabelData](./filter-base#valueandlabeldata) }
- 默认值: {}

### `moduleName`

- 描述: `查询方案标识。必须传入、否则报错。必须唯一，不能和其他查询方案重复。建议用路由的路径---驼峰表示(不要带/)`
- 描述: `查询方案标识。必须传入、否则报错。必须唯一，不能和其他查询方案重复。建议用路由的路径---驼峰表示(不要带/)`
- 描述: `查询方案标识。必须传入、否则报错。必须唯一，不能和其他查询方案重复。建议用路由的路径---驼峰表示(不要带/)`
- 类型: string
- 默认值: 无

```ts
const path = '/jumai-cloud-wms/index';
const moduleName = 'egenieCloudWmsIndex';
```

### `dictList`

- 描述: 字典列表。需要和后端确认。字典需要从方案配置接口获取就传入、不需要就不传入(`云仓不要传了`)
- 类型?: string
- 默认值: 空字符

### `itemList`

- 描述: 类似字典列表(`云仓不要传了`)
- 类型?: string
- 默认值: 空字符

### `fieldMap`

- 描述: 字段的映射。后端的字典列表---> filterItems 字段。返回的 key 和 item 的 field 不一致需要传入对应映射(`云仓不要传了`)
- 类型?: {[key: string]: string | string[]; }
- 默认值: {}

```ts
{
  // 一对一
  key1: 'field1',

  // 一对多
  key2: ['field1', 'field2'],
}
```

### `gridModel`

- 描述: 表格配置
- 类型?: `MainSubStructureModel`
- 默认值: {}

## `showProgrammeCount`

- 前提 1: `jumai-common版本大于等于0.12.33`
- 前提 2: `jumai-utils版本大于等于0.12.34`
- 描述: 是否显示查询方案数量角标
- 类型: boolean
- 默认值: false

## `customTableRender`

- 前提: `jumai-utils版本大于等于2.0.32`
- 描述: 右侧表格自定义渲染,至少完成一个查询(自定义查询不需要传入 gridModel)
- 类型

```ts
{
  onQuery: (...args: any[]) => Promise<any>;
};
```

- 默认值: null

## Programme`实例属性和方法`

### `filterItems`

- 描述: `FilterItems的instance`
- 类型: [FilterItems](./filter-items#实例属性和方法)
- 默认值: 无

### `gridModel`

- 描述: 主表 model
- 类型: `MainSubStructureModel`
- 默认值: 无

## ProgrammeComponent 的 props

### `store`

- 描述: 方案 store
- 类型: `Programme`

### `className`

- 描述: 类名
- 类型?: `string`
- 默认值: 无

### `style`

- 描述: style
- 类型?: `React.CSSProperties`
- 默认值: 无

### `summaryStatistic`

- 前提: `jumai-common,jumai-utils版本大于等于0.12.25`
- 描述: 概括统计
- 类型?: `React.ReactNode`
- 默认值: 无

### `customTableRender`

- 前提: `jumai-utils版本大于等于2.0.32`
- 描述: 右侧表格自定义渲染视图层
- 类型?: `React.ReactNode`
- 默认值: 无

## 视图层示例

```tsx | pure
import { request, PaginationData, MainSubStructureModel, Programme, ProgrammeComponent } from 'jumai-utils';
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

  public programme = new Programme({
    gridModel: this.mainSubStructureModel,
    filterItems: [],
    moduleName: '你的moduleName',
  });
}

const store = new Store();

export default function () {
  return <ProgrammeComponent store={store.programme} />;
}
```

## 自定义渲染表格示例

```tsx | pure
import { Programme, ProgrammeComponent } from 'jumai-utils';
import React from 'react';

export class Store {
  public programme = new Programme({
    moduleName: '你的moduleName',
    customTableRender: { onQuery: () => Promise.resolve() },
  });
}

const store = new Store();

export default function () {
  return <ProgrammeComponent customTableRender={<h1>hello</h1>} store={store.programme} />;
}
```
