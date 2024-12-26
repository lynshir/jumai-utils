---
title: 子表配置参数
order: 5
toc: content
---

# `EgGridModel子表配置`

## `activeTab`

- 默认选中的子表
- 类型: string

## `tabsFlag`

- 描述:
- 类型: {inited:[IObj](./ieg-grid-types#IObj),searched: [IObj](./ieg-grid-types#IObj)}

## `list`

- 描述: 行数据
- 默认值:[]

#### `tab`

- 描述: 子表名称及子表 key
- 类型: { name:string; value:string; }

#### `grid`

- 描述: 子表表格
- 类型: [IEgGridModel](./ieg-grid-model#columns)

#### `api`

- 描述: 子表 api 回调
- 类型: [IEgGridApi](./ieg-grid-api#onRowClick)
- 默认值:{}

#### `isCustom`

- 描述: 是否自定义子表
- 类型: boolean

#### `customModel`

- 描述: 自定义子表的状态
- 类型: [IObj](./ieg-grid-types#IObj)

#### `customView`

- 描述: 自定义子表的 view
- 类型: React.ReactType

#### `allFilterItemsInOneGroup`

- 描述: 是否组合查询
- 类型: boolean

#### `clearAfterChangeFilterItem`

- 描述: 改变条件后是否清空
- 类型: boolean
-

#### `buttons`

- 描述: 子表查询按钮组
- 类型: buttons?: (subTable: SubTableModel) => [IButton](../permission#主表按钮配置项)[];
