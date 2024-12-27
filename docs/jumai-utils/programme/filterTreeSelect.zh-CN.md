---
title: FilterTreeSelect
order: 120
toc: content
---

## `type`

- 描述: 类型标志
- 类型: 'treeSelect'
- 默认值: 'treeSelect'

## `isParamList`

- 前提: `jumai-common、jumai-utils版本大于等于0.12.0`
- 描述: 是否将参数转化为 Array,原来只支持转为 string
- 类型: boolean
- 默认值: false

## `treeData`

- 描述: treeNodes 数据
- 类型: FilterTreeSelectItem[]
- 默认值: []

```ts
export interface FilterTreeSelectItem {
  id?: number;
  pid?: number;
  value: string;
  title: string | React.ReactNode;
  children?: FilterTreeSelectItem[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  isLeaf?: boolean;
  [key: string]: any;
}
```

## `value`

- 描述: 选中值
- 类型: string[]
- 默认值: []

## `onChangeCallback`

- 描述: 改变值回掉
- 类型?: (value?: string[]) => void
- 默认值: 无

## `onSelectCallback`

- 描述: 被选中回掉
- 类型?: (value?: string) => void
- 默认值: 无

## `placeholder`

- 描述: 输入框提示文字
- 类型: string
- 默认值: 请输入

## `allowClear`

- 描述: 是否可清除
- 类型: boolean
- 默认值: true

## `disabled`

- 描述: 是否禁止
- 类型: boolean
- 默认值: false

## `autoClearSearchValue`

- 描述: 当多选模式下值被选择，自动清空搜索框
- 类型: boolean
- 默认值: true

## `showArrow`

- 描述: 是否显示 suffixIcon，单选模式下默认 true
- 类型: boolean | undefined
- 默认值: undefined

## `showSearch`

- 描述: 是否显示搜索框
- 类型: boolean
- 默认值: false

## `loadData`

- 描述: 异步加载数据
- 类型?: (node: any) => Promise\<any>
- 默认值: 无

## `multiple`

- 描述: 支持多选（当设置 treeCheckable 时自动变为 true）
- 类型: boolean
- 默认值: false

## `treeCheckable`

- 描述: 显示 Checkbox
- 类型: boolean
- 默认值: false

## `showCheckedStrategy`

- 描述: 配置 treeCheckable 时，定义选中项回填的方式。
  - SHOW_ALL: 显示所有选中节点(包括父节点)
  - SHOW_PARENT: 只显示父节点(当父节点下所有子节点都选中时)
  - SHOW_CHILD: 只显示子节点
- 类型: 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD'
- 默认值: 'SHOW_ALL'

## `treeDefaultExpandAll`

- 描述: 默认展开所有树节点
- 类型: boolean
- 默认值: false

## `treeDefaultExpandedKeys`

- 描述: 默认展开的树节点
- 类型: string[] | undefined
- 默认值: undefined

## `treeExpandedKeys`

- 描述: 展开的树节点
- 类型: string[] | undefined
- 默认值: undefined

## `treeNodeFilterProp`

- 描述: 输入项过滤对应的 treeNode 属性
- 类型: string
- 默认值: 'title'

## `treeNodeLabelProp`

- 描述: 作为显示的 prop 设置
- 类型: string
- 默认值: 'title'

## [其他](./filter-base#filterbase)
