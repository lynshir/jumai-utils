---
title: FilterInput
order: 20
toc: content
---

## `type`

- 描述: 类型标志
- 类型: 'input'
- 默认值: 'input'

## `value`

- 描述: 输入的值
- 类型: string
- 默认值: 空字符

## `onChangeCallback`

- 描述: 改变值回掉
- 类型?: (value?: string) => void
- 默认值: 无

## `isTrimWhiteSpace`

- 描述: 是否去掉左右空格
- 类型: boolean
- 默认值: true

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

## `isMultipleSearch`

- 前提: `egenie-common,egenie-utils版本大于等于0.12.19`
- 描述: 是否批量查询
- 类型: boolean
- 默认值: false

## `splitSymbol`

- 前提 1: `egenie-common,egenie-utils版本大于等于0.12.19`
- 前提 2: `isMultipleSearch = true`
- 描述: 批量查询切分符号(转化为参数)
- 类型: ' ' | ','(空格或者逗号)
- 默认值: ,(逗号)

## [其他](./filter-base#filterbase)
