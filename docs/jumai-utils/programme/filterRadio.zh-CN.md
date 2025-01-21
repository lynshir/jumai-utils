---
title: FilterRadio
order: 50
toc: content
---

## `type`

- 描述: 类型标志
- 类型: 'radio'
- 默认值: 'radio'

## `data`

- 描述: `单选的数据。item的showInput为true时，此项为可选可输入`
- 类型: [ValueAndLabelData](./filter-base#valueandlabeldata)
- 默认值: []

```json
{
  "value": "aaa",
  "label": "bbb",
  "showInput": true // 此项为可选可输入
}
```

## `inputValue`

- 描述: 输入框的值(`可选可输入时才有用`)
- 类型: string
- 默认值: 空字符

## `value`

- 描述: 选择的值
- 类型: undefined | string
- 默认值: undefined

## `placeholder`

- 描述: 输入框提示文字(`可选可输入时才有用`)
- 类型: string
- 默认值: 请输入

## `disabled`

- 描述: 是否禁止
- 类型: boolean
- 默认值: false

## `handleChangeCallback`

- 描述: 值改变回掉
- 类型?: (value?: string | undefined) => void
- 默认值: 无

## [其他](./filter-base#filterbase)
