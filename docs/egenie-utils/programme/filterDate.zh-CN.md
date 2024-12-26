---
title: FilterDate
order: 70
toc: content
---

## `type`

- 描述: 类型标志。date 为左右查询方案类型(带下拉选择)。dateRange 为 DatePicker.Range
- 类型: 'date' | 'dateRange'
- 默认值: 'date'

## dateDictValue

- 描述: 时间字典的值
- 前提 1: `egenie-utils版本大于等于1.3.6`
- 前提 2: `在dateDict可以找到此值`
- 作用 1: 通过此值在初始时预设时间,比如传递 today,根据 dateDict 生成时间
- 作用 2: 创建查询方案后,后面的时间不是写死的时间,根据 dateDict 生成时间
- 作用 3: 跳转页面时如果参数中对应时间的字段存在 dateDict 中,根据 dateDict 生成时间

> 跳转页面传参数

```js
// 类型为date
const params = 'date=时间类型,today';

// 类型为dateRange
const params = 'dateRange=today';
```

- 类型?: string

- 默认值: 空字符

## `dateTypeParamsField`

- 描述: 日期类型转化为参数的 field
- 前提 1: `egenie-common版本大于等于1.2.15且egenie-utils版本大于等于1.3.6`
- 前提 2: `startParamsField和endParamsField必须同时存在`
- 类型?: string
- 默认值: 'dateType'

> 自定义参数说明---日期类型为 date

```json
{
  "startParamsField": "start",
  "endParamsField": "end",
  "dateTypeParamsField": "dateType",
  "type": "date"
}
```

- 转化结果

```json
{
  "dateType": "日期类型",
  "start": "开始时间",
  "end": "结束时间"
}
```

## `startParamsField`

- 描述: 开始时间转化为参数的 field
- 前提 1: `egenie-common版本大于等于1.2.15且egenie-utils版本大于等于1.2.15`
- 前提 2: `startParamsField和endParamsField必须同时存在`
- 类型?: string
- 默认值: 空字符

> 自定义参数说明---日期类型为 dateRange

```json
{
  "startParamsField": "start",
  "endParamsField": "end",
  "type": "dateRange"
}
```

- 转化结果

```json
{
  "start": "开始时间",
  "end": "结束时间"
}
```

## `endParamsField`

- 描述: 结束时间转化为参数的 field
- 前提 1: `egenie-common版本大于等于1.2.15且egenie-utils版本大于等于1.2.15`
- 前提 2: `startParamsField和endParamsField必须同时存在`
- 类型?: string
- 默认值: 空字符

## `data`

- 描述: `日期类型的数据`
- 类型: [ValueAndLabelData](./filter-base#valueandlabeldata)
- 默认值: []

## `allowClear`

- 描述: `是否允许清除`
- 类型: boolean
- 默认值: true

## `allowEmpty`

- 描述: `允许起始项部分为空。type为dateRange生效`
- 类型: [boolean, boolean]
- 默认值: [true, true]

## `selectValue`

- 描述: 日期类型选中值
- 类型: string | undefined
- 默认值: undefined

## `handleChangeCallback`

- 描述: 日期改变回掉
- 类型?: (date?: [moment.Moment, moment.Moment]) => void
- 默认值: 无

## `format`

- 描述: 日期展示格式
- 类型: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD'
- 默认值: 'YYYY-MM-DD HH:mm:ss'

## `formatParams`

- 描述: 日期转化成参数格式
- 类型: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD'
- 默认值: 'YYYY-MM-DD HH:mm:ss'

## `startTime`

- 描述: 开始时间
- 类型: moment.Moment | null
- 默认值: null

## `endTime`

- 描述: 结束时间
- 类型: moment.Moment | null
- 默认值: null

## `disabled`

- 描述: 禁止状态
- 类型: [boolean, boolean]
- 默认值: [false, false]

## `placeholder`

- 描述: 输入框提示文字
- 类型: [string, string]
- 默认值: ['开始时间', '结束时间']

## `dateDict`

- 描述: 预设时间字典。可以根据实际选取，或者新增
- 类型:

```ts
Array< 'upToNow' | 'today' | 'yesterday' | 'recentThreeDays' | 'thisWeek' | 'recentSevenDays' | 'recentFifteenDays' | 'lastMonth' | 'thisMonth' | 'recentThirtyDays' | 'thisQuarter' | 'recentHalfYear' | 'thisYear' | 'recentYear' | { value: string; label: string; getTimes: () => [moment.Moment, moment.Moment]; }>
```

- 默认值:

```ts
[
  'today',
  'yesterday',
  'recentThreeDays',
  'thisWeek',
  'recentSevenDays',
  'recentFifteenDays',
  'thisMonth',
  'recentThirtyDays',
  'thisQuarter',
  'recentHalfYear',
  'thisYear',
  'recentYear',
];
```

> 自定义:

```ts
import moment from 'moment';

{
    value: 'today',
    label: '今天',
    getTimes() {
      return [
        moment()
          .startOf('day'),
        moment()
          .endOf('day'),
      ];
    },
}
```

## `dateDictValue`

- 描述: 默认的字典值,会根据字典设置对应开始时间和结束时间
- 类型: 'upToNow' | 'today' | 'yesterday' | 'recentThreeDays' | 'thisWeek' | 'recentSevenDays' | 'recentFifteenDays' | 'lastMonth' | 'thisMonth' | 'recentThirtyDays' | 'thisQuarter' | 'recentHalfYear' | 'thisYear' | 'recentYear'
- 默认值: null

## [其他](./filter-base#filterbase)
