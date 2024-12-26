---
title: FilterInputAndSelect
order: 60
toc: content
---

## `type`

- 描述: 类型标志
- 类型: 'inputAndSelect'
- 默认值: 'inputAndSelect'

## `inputValue`

- 描述: 输入框的值
- 类型: string
- 默认值: 空字符

## `handleInputChangeCallback`

- 描述: 输入框改变值回掉
- 类型?: (value?: string) => void
- 默认值: 无

## `selectValue`

- 描述: 下拉框的值
- 类型: string
- 默认值: 空字符

## `handleSelectChangeCallback`

- 描述: 下拉框改变值回掉
- 类型?: (value?: string) => void
- 默认值: 无

## `placeholder`

- 描述: 输入框提示文字
- 类型: string
- 默认值: 请输入

## `allowClear`

- 描述: 是否可以清除
- 类型: boolean
- 默认值: true

## `disabled`

- 描述: 禁止状态
- 类型: boolean
- 默认值: false

## `isTrimWhiteSpace`

- 描述: 是否去掉输入框左右空格
- 类型: boolean
- 默认值: true

## `splitSymbol`

- 前提: `egenie-common,egenie-utils版本大于等于0.12.19`
- 描述: 批量查询切分符号(转化为参数)
- 类型: ' ' | ','(空格或者逗号)
- 默认值: ,(逗号)

## `data`

- 描述: `下拉框的数据`
- 类型: [ValueAndLabelData](./filter-base#valueandlabeldata)
- 默认值: []
- 批量查询: `egenie-common,egenie-utils版本大于等于0.12.19`

```json
{
  "value": "aaa",
  "label": "bbb",
  "isMultipleSearch": true // 此项的输入框为批量查询
}
```

## [其他](./filter-base#filterbase)
