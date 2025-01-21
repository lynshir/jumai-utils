---
title: FilterDateStartOrEnd
order: 80
toc: content
---

## `picker`

- 前提: `jumai-common和jumai-utils版本大于等于0.14.55`
- 描述: DatePicker.picker
- 类型: 'date' | 'week' | 'month' | 'quarter' | 'year'
- 默认值: 'date'
- 类型不为 date 时转化为查询条件的参数自行处理
  - filterItems.params 内部拿到对应 field 的字符串值处理(如果外部有导出需要处理二次)
  - `重写FilterDateStartOrEnd内部的toParams方法(如果外部有导出只用处理一次)---建议用这个`

```typescript
import type { FilterDateStartOrEnd } from 'jumai-common';

const normalProgramme = new NormalProgramme({
  filterItems: [
    {
      type: 'dateStart',
      field: 'dateStart',
      label: 'dateStart',
      picker: 'month',
      toParams: () => {
        const filterDateStartOrEnd = normalProgramme.filterItems.getFilterItem('dateStart') as FilterDateStartOrEnd;
        if (filterDateStartOrEnd.value) {
          return {
            // 根据实际情况选择,用法参考moment
            [filterDateStartOrEnd.field]: filterDateStartOrEnd.value.startOf('month').format('YYYY-MM-DD'),
          };
        }

        return {};
      },
    },
    {
      type: 'dateEnd',
      field: 'dateEnd',
      label: 'dateEnd',
      picker: 'month',
      toParams: () => {
        const filterDateStartOrEnd = normalProgramme.filterItems.getFilterItem('dateEnd') as FilterDateStartOrEnd;
        if (filterDateStartOrEnd.value) {
          return {
            // 根据实际情况选择,用法参考moment
            [filterDateStartOrEnd.field]: filterDateStartOrEnd.value.endOf('month').format('YYYY-MM-DD'),
          };
        }

        return {};
      },
    },
  ],
  handleSearch: () => {
    console.log(normalProgramme.filterItems.params);
    return Promise.resolve();
  },
  count: 6,
});
```

## `type`

- 描述: 类型标志。dateStart 为选择开始时间。dateEnd 为选择结束时间
- 类型: 'dateStart' | 'dateEnd'
- 默认值: 'dateStart'

## `handleChangeCallback`

- 描述: 日期改变回掉
- 类型?: (value: moment.Moment | null) => void
- 默认值: 无

## `allowClear`

- 描述: `是否允许清除`
- 类型: boolean
- 默认值: true

## `format`

- 描述: 日期展示格式
- 类型: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD'
- 默认值: 'YYYY-MM-DD HH:mm:ss'

## `formatParams`

- 描述: 日期转化成参数格式
- 类型: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD'
- 默认值: 'YYYY-MM-DD HH:mm:ss'

## `value`

- 描述: 时间
- 类型: moment.Moment | null
- 默认值: null

## `disabled`

- 描述: 禁止状态
- 类型: boolean
- 默认值: false

## `placeholder`

- 描述: 输入框提示文字
- 类型: string
- 默认值: '开始时间' | '结束时间'

## `disabledDate`

- 描述: 不可选择的日期,参考 antd
- 前提: `jumai-utils版本大于等于1.2.25`
- 类型: DatePickerProps['disabledDate']
- 默认值: null

## `disabledTime`

- 描述: 不可选择的时间,参考 antd
- 前提: `jumai-utils版本大于等于1.2.25`
- 类型: () => any
- 默认值: null

## [其他](./filter-base#filterbase)
