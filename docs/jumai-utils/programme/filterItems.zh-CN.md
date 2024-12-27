---
title: FilterItems
order: 140
toc: content
---

# `此类为上下、左右查询方案model层核心。在查询方案里的用法和下面的用法大体一致(获取实例有所区别)`

- 请先了解[FilterBase](filter-base#filterbase)公共字段的含义。`field`、`label`, `type`, `data`

## 构造函数参数

### `filterItems`

- 描述: 查询项配置
- 类型?: [FilterItemOptions](./filter-base#filteritemoptions)[]
- 默认值: []

### `dict`

- 描述: 字典
- 类型?: { [key: string]: [ValueAndLabelData](./filter-base#valueandlabeldata) }
- 默认值: {}

## 实例属性和方法

### `dict`

- 描述: 字典数据(查询项的 data 属性)
- 类型: {[key: string]: [ValueAndLabelData](./filter-base#valueandlabeldata); }
- 默认值: {}

### `addDict`

- 描述: 动态添加字典数据
- 类型: (dict: { [key: string]: [ValueAndLabelData](./filter-base#valueandlabeldata) }) => void
- 默认值: 无

### `addItem`

- 描述: 动态添加查询项。`field`、`label`、`type`必须
- 类型: (data: [FilterItemOptions](./filter-base#filteritemoptions)[]) => void
- 默认值: 无

### `reset`

- 描述: 重置所有查询项的值为初始的状态
- 类型: () => void
- 默认值: 无

### `updateFilterItem`

- 描述: 更新查询项的值。`filed`必须、`type`建议写、其它需要更新的字段
- 类型: (data: [FilterItemOptions](./filter-base#filteritemoptions)[]) => void
- 默认值: 无

### `getFilterItem`

- 描述: 获取某一项查询项
- 类型: (field: string) => [FilterItem](./filter-base#filteritem) | undefined
- 默认值: 无

### `params`

- 描述: 获取查询项的查询参数(`计算属性`)
- 类型: `{[p: string]: string | string[]; };`
- 默认值: {}

### connect

- 描述: 外部 model 连接到查询项
- 类型: (connectListItem: ConnectListItem) => void
- 默认值: null

```ts
interface ConnectListItem {
  // 添加到filterItems的参数,可以直接在filterItems.params查看到
  toParams: () => { [key: string]: string | string[] };
  // 重置函数,filterItems.reset时会调用
  reset?: () => void;
  // 校验函数,filterItems.validator时会调用
  validator?: () => Promise<string>;
  [key: string]: any;
}
```

### `translateParamsList`

- 描述: 获取查询项翻译列表(`计算属性`)
- 类型: `string[][]`
- 默认值: []

### `translateParams`

- 描述: 获取查询项翻译的值(`计算属性`)
- 类型: `string[]`;
- 默认值: []

### `validator`

- 描述: 校验查询项(配合查询项的`require`属性)
- 类型: () => Promise\<string>
- 默认值: 无

## 示例

### 构建

```ts
import { FilterItems, FilterItemOptions } from 'jumai-utils';

const filterItemsOptions: FilterItemOptions[] = [
  {
    type: 'input',
    label: 'input_label',
    field: 'input_field',
  },
  {
    type: 'select',
    label: 'select_label',
    field: 'select_field',
    required: true,
    mode: 'multiple',
    data: [
      {
        value: 'a',
        label: '1',
      },
      {
        value: 'b',
        label: '2',
      },
    ],
  },
];

const filterItems = new FilterItems({
  filterItems: filterItemsOptions,
  dict: { select_field: [] },
});
```

### `添加字典数据`

- `在dict参数传递(key为查询项的field)`
- `在查询项直接通过data`
- `通过filterItems.addDict`(field 对应)

```ts
filterItems.addDict({ select_field: [] });
```

### `动态添加查询项`

```ts
filterItems.addItem([
  {
    field: 'aaa',
    label: 'aaa_label',
    type: 'input',
  },
]);
```

### `更新查询项的值`

- `field必须对应,type建议写(有ts提示),其他为更新的值`

```ts
filterItems.updateFilterItem([
  {
    field: 'input_field',
    type: 'input',
    value: 'aaa',
  },
]);
```

### `获取某一项查询项`

```ts
filterItems.getFilterItem('select_field');
```

### `校验查询项`

- `查询项require为true`

```ts
filterItems.validator().then(() => {
  // 你的业务逻辑
});
```

### `跳转页面带参数`

- url 如: ?key1=value1&key2=value2
- `key就是查询项的field,value为查询项的值(多个以,分隔)`
- 特殊 value:
  - `inputNumberGroup`: min,max
  - `date`: 时间类型(下拉框的值),开始时间字符串,结束时间字符串
  - `dateRange`: 开始时间字符串,结束时间字符串
  - `inputAndSelect`: type(下拉框的值),value(输入框的值)
  - `patternSearch`: selectValue(下拉框的值),inputValue(输入框的值)

```ts
const search = '?select_field=a,b';
```
