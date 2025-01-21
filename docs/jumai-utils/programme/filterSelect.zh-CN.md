---
title: FilterSelect
order: 40
toc: content
---

## `type`

- 描述: 类型标志
- 类型: 'select'
- 默认值: 'select'

## `isParamList`

- 前提: `jumai-common、jumai-utils版本大于等于0.12.0`
- 描述: 是否将参数转化为 Array(mode 等于 multiple),原来只支持转为 string
- 类型: boolean
- 默认值: false

## `data`

- 描述: `下拉框数据`
- 类型: [ValueAndLabelData](./filter-base#valueandlabeldata)
- 默认值: []

## `value`

- 描述: 选中值
- 类型: string | undefined | string[]
  - 单选为: string | undefined 多选为: string[]
- 默认值: undefined

## `onChangeCallback`

- 描述: 值改变回掉
- 类型?: (value?: string | string[] | undefined) => void
  - 单选为: string | undefined 多选为: string[]
- 默认值: 无

## `onSearchCallback`

- 描述: 搜索值改变回掉
- 类型?: (value?: string) => void
- 默认值: 无

## `disabled`

- 描述: 是否禁止
- 类型: boolean
- 默认值: false

## `allowClear`

- 描述: 是否可清除
- 类型: boolean
- 默认值: true

## `placeholder`

- 描述: 输入框提示文字
- 类型: string
- 默认值: 单选: 请选择 多选: 请选择(可多选)

## `showSearch`

- 描述: 是否可搜索
- 类型: boolean
- 默认值: true

## `showChooseAll`

- 前提: `jumai-common和jumai-utils版本大于等于0.12.40`
- 描述: 是否可以选中全部和显示左匹配。多选才能生效
- 类型: boolean
- 默认值: false

## `maxItemsLength`

- 描述: 最多显示数量
- 类型: number
- 默认值: 1000

## `mode`

- 描述: 模式。默认单选、`multiple为多选`
- 类型: `'multiple' | undefined`
- 默认值: undefined

## `showArrow`

- 描述: 是否显示下拉小箭头
- 类型: boolean
- 默认值: true

## `optionFilterProp`

- 前提 1: `jumai-common、jumai-utils版本大于等于0.14.43`
- 前提 2: 多字段搜索要求`jumai-utils版本大于等于1.2.24`
- 描述: 筛选字段(`string代表搜索单个字段,array代表搜索多个字段`)
- 类型: string | string[]
- 默认值: label

## [其他](./filter-base#filterbase)
