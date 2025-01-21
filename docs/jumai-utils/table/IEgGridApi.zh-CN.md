---
title: 表格回调方法
order: 2
toc: content
---

# `EgGridModel配置api中的回调`

## `onRowClick`

- 行点击回调
- 类型: (rowId: [StrOrNum](./ieg-grid-types#StrOrNum), row?:[IObj](./ieg-grid-types#IObj)) => void;

## `onRowSelectChange`

- 描述: 行选择改变回调
- 类型: (ids: Set<React.Key>) => void;

## `onRefresh`

- 描述: 刷新主表
- 类型: (param?: [IObj](./ieg-grid-types#IObj)) => void;

## `onSort`

- 描述: 排序回调
- 类型: (params: [IObj](./ieg-grid-types#IObj)) => void;

## `onPageChange`

- 描述: 分页器 change 事件
- 类型: (page: [StrOrNum](./ieg-grid-types#StrOrNum), pageSize: [StrOrNum](./ieg-grid-types#StrOrNum)) => void;

## `onShowSizeChange`

- 描述: 分页 pageSizeChange
- 类型: (page: [StrOrNum](./ieg-grid-types#StrOrNum), pageSize: [StrOrNum](./ieg-grid-types#StrOrNum)) => void;

## `onQuery`

- 描述: 查询事件，组合查询方案参数、重置所有
- 类型: (params?: any) => Promise<unknown>;

## `callbackAfterQuery`

- 描述: 查询时的回调
- 类型: (params?: any) => void;

## `onToggleOrDeleteSubRow`

- 描述: 在此方法里请求回来的数据再自行做处理
- 类型: (rest?: [SubRowAction](./ieg-grid-types#SubRowAction)) => Promise<ISubRow[] | boolean>;

## `onMouseInRow`

- 描述: 行悬浮进入事件
- 类型: ((rowIdx: number, row: [IObj](./ieg-grid-types#IObj), event?: React.UIEvent) => void) | null;

## `onMouseOutRow`

- 描述: 行悬浮离开事件
- 类型: ((rowIdx: number, row: [IObj](./ieg-grid-types#IObj), event?: React.UIEvent) => void) | null;
