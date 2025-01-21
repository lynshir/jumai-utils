---
title: FilterPatternSearch
order: 130
toc: content
---

## `type`

- 描述: 类型标志
- 类型: 'patternSearch'
- 默认值: 'patternSearch'

## `data`

```ts
interface FilterPatternSearchData {
  value: string;
  label: string;
  clearInputValue?: boolean;
  inputFocus?: boolean;
  inputDisabled?: boolean;

  [key: string]: any;
}
```

- 描述: 选择的数据
- 类型: FilterPatternSearchData[]
- 默认值: []
- `clearInputValue`: 当选中此值是否清除输入框的值。默认 false
- `inputFocus`: 当选中此值输入框是否自动获取焦点。默认 false
- `inputDisabled`: 当选中此值输入框是否禁止。默认 false

> 包含和不包含

```json
{
  "type": "patternSearch",
  "field": "patternSearch",
  "label": "patternSearch",
  "selectParamsField": "select",
  "inputParamsField": "input",
  "data": [
    {
      "value": "1",
      "label": "包含",
      "inputFocus": true
    },
    {
      "value": "2",
      "label": "不包含",
      "inputFocus": true
    },
    {
      "value": "3",
      "label": "有",
      "inputDisabled": true,
      "clearInputValue": true
    },
    {
      "value": "4",
      "label": "无",
      "inputDisabled": true,
      "clearInputValue": true
    }
  ]
}
```

## `selectParamsField`

- 描述: 选择的值转化为参数的字段
- 类型: string
- 默认值: 空字符

## `inputParamsField`

- 描述: 输入的值转化为参数的字段
- 类型: string
- 默认值: 空字符

> 自定义参数字段

- 说明
  - `inputParamsField和selectParamsField同时存在才生效`
  - `inputParamsField和selectParamsField的值相同时取输入框的值`
- 自定义设置

```json
{
  "selectParamsField": "aaa",
  "inputParamsField": "bbb"
}
```

- 转化结果

```json
{
  "aaa": "选择的值",
  "bbb": "输入的值"
}
```

- `不自定义转化的结果`

```json
{ "field": "选择的值,输入的值" }
```

## `inputValue`

- 描述: 输入框的值
- 类型: string
- 默认值: 空字符

## `handleInputChangeCallback`

- 描述: 输入值改变回掉
- 类型?: (value?: string) => any
- 默认值: 无

## `selectValue`

- 描述: 选择的值
- 类型: string | undefined
- 默认值: undefined

## `handleSelectChangeCallback`

- 描述: 选择值改变回掉
- 类型?: (value?: string | undefined) => any
- 默认值: 无

## `inputPlaceholder`

- 描述: 输入框提示文字
- 类型: string
- 默认值: 请输入

## `isTrimWhiteSpace`

- 描述: 是否去掉输入框左右空格
- 类型: boolean
- 默认值: true

## `allowClear`

- 描述: 输入框是否可清除
- 类型: boolean
- 默认值: true

## `isMultipleSearch`

- 前提: `jumai-common,jumai-utils版本大于等于0.14.16`
- 描述: 是否批量查询
- 类型: boolean
- 默认值: false

## `splitSymbol`

- 前提 1: `jumai-common,jumai-utils版本大于等于0.14.16`
- 前提 2: `isMultipleSearch = true`
- 描述: 批量查询切分符号(转化为参数)
- 类型: ' ' | ','(空格或者逗号)
- 默认值: ,(逗号)

## [其他](./filter-base#filterbase)
