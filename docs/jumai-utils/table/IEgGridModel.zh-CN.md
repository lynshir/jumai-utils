---
title: 表格配置参数
order: 4
toc: content
---

# `EgGridModel表格配置`

## `columns`

- 列配置
- 类型: [Columns](./ieg-grid-types#Columns)[]

## `getColumns`

- 描述: 需要对列做特殊处理才用到
- 类型: (topClass: IObj, selfClass: IObj => [Columns](./ieg-grid-types#Columns)[]

## `rows`

- 描述: 行数据
- 类型: [IObj](./ieg-grid-types#IObj)[]

## `cursorRow`

- 描述: 当前聚焦行
- 类型: [IObj](./ieg-grid-types#IObj)[]

## `primaryKeyField`

- 描述: 主键
- 类型: string

## `rowHeight`

- 描述: 行高
- 类型: number | ((args: RowHeightArgs) => number) | null

## `headerRowHeight`

- 描述: 表头行高
- 类型: number

## `showCheckBox`

- 描述: 是否可多选
- 类型: boolean

## `selectedIds`

- 描述: 已选择的 ids
- 类型: Set<React.Key>

## `clearToOriginal`

- 描述: 清空到原始状态
- 类型: () => void

## `sortByLocal`

- 描述: 是否开启本地排序
- 类型: boolean

## `sortDirection`

- 描述: 排序方向
- 类型: [SortDirection](./ieg-grid-types#SortDirection)

## `showQuickJumper`

- 描述: 分页器-快速跳转
- 类型: boolean

## `pageSizeOptions`

- 描述: 分页器-分页大小 list
- 类型: string[]

## `pageSize`

- 描述: 分页器-每页条数
- 类型: number

## `current`

- 描述: 分页器-当前页码
- 类型: number

## `total`

- 描述: 分页器-总条数
- 类型: number

## `showSelectedTotal`

- 描述: 分页器-是否显示已勾选条数
- 类型: boolean

## `showPagination`

- 描述: 是否显示分页器
- 类型: boolean

## `showReset`

- 描述: 是否显示重置按钮
- 类型: boolean

## `showPager`

- 描述: 是否显示分页器整行
- 类型: boolean

## `showRefresh`

- 描述: 是否显示刷新按钮
- 类型: boolean

## `loading`

- 描述: 表格数据加载 loading
- 类型: boolean

## `edgStyle`

- 描述: 表格包裹样式
- 类型: React.CSSProperties

## `api`

- 描述: 外部回调的 api
- 类型: [IEgGridApi](./i-eg-grid-api#onRowClick)

## `queryParam`

- 描述: 查询参数
- 默认值:{}

  #### `pageSize`

  - 描述: 每页条数
  - 类型: [StrOrNum](./ieg-grid-types#StrOrNum)

  #### `page`

  - 描述: 当前页
  - 类型: [StrOrNum](./ieg-grid-types#StrOrNum)

  #### `sord`

  - 描述: 升排或降排
  - 类型: [SortDirection](./ieg-grid-types#SortDirection)

  #### `sidx`

  - 描述: 排序字段
  - 类型: [StrOrNum](./ieg-grid-types#StrOrNum)

#### `filterParams`

- 描述: 查询方案的值
- 类型: [IObj](./ieg-grid-types#IObj)

## `getFilterParams`

- 描述: 获取查询方案的值
- 类型: () => { [key: string]: string }

## `wrapClassName`

- 描述: 表格包裹类名
- 类型: string

## `showEmpty`

- 描述: 是否显示空状态
- 类型: boolean

## `forceRowClick`

- 描述: 是否强制点击事件，设为 true 后，每次点击同一行也会调用接口
- 类型: boolean
- 默认值: false

## `showNoSearchEmpty`

- 描述: 显示空状态
- 类型: boolean

## `showNormalEmpty`

- 描述: 显示普通空态
- 类型: boolean

## `setColumnsDisplay`

- 描述: 是否允许设置列显隐
- 类型: boolean

## `gridIdForColumnConfig`

- 描述: 表格保存列，当 setColumnsDisplay 为 true，此配置必须配置，配置规则尽可能以 ts\_\_开头，避免与原 js 项目中的表格配置冲突
- 类型: string

## `summaryRows`

- 描述: 汇总方式，配置此字段将会在表格行的尾部增加一条 row 数据
- 类型: [TSummaryRows](./ieg-grid-types#TSummaryRows)

## `sumColumns`

- 描述: 汇总方式，配置此字段将会在表格的 pager 部分显示汇总信息
- 类型: [TSummaryRows](./ieg-grid-types#TSummaryRows)

## `onSelectSum`

- 描述: 汇总方式使用，是否勾选汇总，设为 false 将会统计本页数据
- 类型: boolean
- 默认值: true

## `searchReduce`

- 描述: 汇总方式使用，是否每次查询表格数据之后调用接口请求数据
- 类型: boolean
- 默认值: false

## `showGridOrderNo`

- 描述: 是否展示序号列
- 类型: boolean

## `batchToogleSubRow`

- 描述: 是否批量展开
- 类型: boolean

## `emptyStatusView`

- 描述: 空状态自定义传入
- 类型: React.ReactNode

## `enableCellScroll`

- 描述: 是否启用单元格滚动
- 类型: boolean
