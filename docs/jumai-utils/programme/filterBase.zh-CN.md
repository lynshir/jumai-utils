---
title: FilterBase
order: 10
toc: content
---

## `ValueAndLabelData`

- 查询项 data 的统一格式(`value必须是string`)
- 类型: `Array<{ value: string; label: string; [key: string]: any; }>`

## `FilterItem`

- 查询项种类
- 类型: [FilterInput](./filter-input) | [FilterInputNumberGroup](./filter-input-number-group) | [FilterSelect](./filter-select) | [FilterRadio](./filter-radio) | [FilterInputAndSelect](./filter-input-and-select) | [FilterDate](./filter-date) | [FilterCheckbox](./filter-checkbox) | [FilterInputOrSelect](./filter-input-or-select) | [FilterCascader](./filter-cascader) | [FilterDateStartOrEnd](./filter-date-start-or-end) | [FilterTreeSelect](./filter-tree-select) | [FilterPatternSearch](./filter-pattern-search);

## `FilterItemOptions`

- 查询项参数
- 类型: Partial<[FilterItem](#filteritem)>

## `FilterBase`

### showItem

- 描述: 是否显示查询项
- 类型: boolean
- 默认值: true

### labelWidth

- 描述: label 显示宽度
- 类型: number
- 默认值: 92

### `type`

- 描述: `查询项类型`
- 类型: 'input' | 'inputAndSelect' | 'inputNumberGroup' | 'radio' | 'select' | 'date' | 'dateRange' | 'dateStart' | 'dateEnd' | 'checkbox' | 'inputOrSelect' | 'cascader' | 'treeSelect' | 'filterPatternSearch'
- 默认值: 无

### `field`

- 描述: `查询项标识。必须且不能重复否则报错`
- 类型: string
- 默认值: 空字符

### `label`

- 描述: `查询项名称。必须且不能重复否则报错`
- 类型: string
- 默认值: 空字符

### `reset`

- 描述: `重置某个查询项为初始状态,data不变`
- 类型: () => void

### style

- 描述: 包裹 div 的样式
- 类型: React.CSSProperties
- 默认值: {}

### className

- 描述: 包裹 div 的 className
- 类型: string
- 默认值: 空字符

### `data`

- 描述: `查询项数据`
- 类型: [ValueAndLabelData](#valueandlabeldata)
- 默认值: []

### `required`

- 描述: `是否为必选字段`
- 类型: boolean
- 默认值: false
