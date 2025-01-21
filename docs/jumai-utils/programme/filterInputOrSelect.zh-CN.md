---
title: FilterInputOrSelect
order: 100
toc: content
---

## `type`

- 描述: 类型标志
- 类型: 'inputOrSelect'
- 默认值: 'inputOrSelect'

## `data`

- 描述: `下拉框数据`
- 类型: [ValueAndLabelData](./filter-base#valueandlabeldata)
- 默认值: []

## `value`

- 描述: 输入的值
- 类型: string
- 默认值: 空字符

## `handleChangeCallback`

- 描述: 值改变回掉
- 类型?: (value?: string | undefined) => void
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

## `isTrimWhiteSpace`

- 描述: 是否去掉输入框左右空格
- 类型: boolean
- 默认值: true

## [其他](./filter-base#filterbase)
