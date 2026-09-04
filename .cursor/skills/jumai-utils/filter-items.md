# 查询项 FilterItems

`type` / `field` / `label` 必填且唯一。`data` 的 `value` 必须是 string。

动态下拉：`filterItems.addDict({ fieldName: [{ value, label }] })`。
改值：`updateFilterItem([{ field, value }])`。
取某一项：`getFilterItem(field)`。
查询参数：`filterItems.params`（已按各 type 的 `toParams` 展开）。
校验：查询时 `Programme.handleSearch` 会跑 `validator`；`required: true` 即可。

公共字段：`required`、`allowClear`、`disabled`、`placeholder`、`showItem`、`labelWidth`、`style`、`isDynamic`。

## type 对照

| type | 形态 | 关键字段 | 默认入参 |
|---|---|---|---|
| `input` | 输入 | `isMultipleSearch` 批量；`splitSymbol` 默认 `','`；`isParamList` 则传数组 | `{ [field]: string \| string[] }` |
| `select` | 下拉 | `mode: 'multiple'` 多选；`data`；`showSearch`；`showChooseAll`；`isParamList` | 多选默认逗号字符串，`isParamList` 为数组 |
| `dateRange` | 区间 | `startParamsField` / `endParamsField`；`format` / `formatParams`；`dateDictValue` 快捷（`today` 等） | 配了起止 field 则拆成两个字段，否则 `{ [field]: 'start,end' }` |
| `date` | 左侧日期类型 + 区间 | `data` 类型选项；`selectValue`；`dateTypeParamsField`（默认 `dateType`）；`startParamsField` / `endParamsField` | 三个 field 都配齐才拆；否则 `{ dateType, dateValue }` |
| `dateStart` / `dateEnd` | 单个开始/结束 | `format` / `formatParams`；`dateEnd` 按日会取当天结束 | `{ [field]: string }` |
| `radio` | 单选 | `data`；某项 `showInput: true` 时可输入 | `{ [field]: value }` |
| `checkbox` | 多选框 | `data`；`isParamList` | 逗号字符串或数组 |
| `boolean` | 是/否 | `yesText` / `noText`；`isFormatBoolean` 默认 true | boolean 或 0/1 |
| `cascader` | 级联 | `data` 树；`isParamList` | 逗号字符串或数组 |
| `treeSelect` | 树选择 | `data` 为 `{ value, title, children }[]` | 逗号字符串或数组 |
| `inputAndSelect` | 左选右输 | `data` + `selectValue`；**入参 key 是选中的 selectValue，不是 field** | `{ [selectValue]: inputValue }` |
| `inputOrSelect` | 可输可下拉 | `data` | `{ [field]: 输入或选中值 }` |
| `inputNumberGroup` | 数字区间 | `minParamsField` / `maxParamsField`；`data.length > 1` 时带类型下拉 | 配了 min/max 则拆字段，否则 `{ [field]: 'min,max' }` |
| `patternSearch` | 模式+输入 | `selectParamsField` / `inputParamsField` | 两个 field 都配才拆，否则 `{ [field]: 'select,input' }` |

## 日期怎么选

- 只要一个时间区间、后端两个字段：用 `dateRange` + `startParamsField` / `endParamsField`。
- 左侧先选「创建时间/完成时间」再选区间：用 `date`。三个映射 field 都配，避免落到默认的 `dateType` + `dateValue`（业务接口经常不是这对名字，需要自己在 `onQuery` 里拆）。
- 只要开始或只要结束：`dateStart` / `dateEnd`。
- `format: 'YYYY-MM-DD'` 时开始会 `startOf('day')`、结束会 `endOf('day')`。`formatParams` 控制传给后端的格式。
- 快捷项：`dateDictValue: 'today' | 'yesterday' | 'recentSevenDays' | 'thisMonth' | ...`。

## 常用片段

```ts
// 批量单号
{ type: 'input', label: '订单编号', field: 'orderNo', isMultipleSearch: true }

// 多选状态（接口要数组时加 isParamList: true）
{ type: 'select', label: '状态', field: 'status', mode: 'multiple', data: STATUS_LIST }

// 区间 → createTimeStart / createTimeEnd
{
  type: 'dateRange',
  label: '创建时间',
  field: 'createdAt',
  format: 'YYYY-MM-DD',
  formatParams: 'YYYY-MM-DD',
  startParamsField: 'createTimeStart',
  endParamsField: 'createTimeEnd',
}

// 类型+区间（左右方案里常见）
{
  type: 'date',
  field: 'dateType',
  label: '日期类型',
  data: [{ label: '到货时间', value: 'arrival' }],
  selectValue: 'arrival',
  dateTypeParamsField: 'dateType',
  startParamsField: 'arrivalBeginDate',
  endParamsField: 'arrivalEndDate',
}
```

## 子表查询项（不是 Programme 那套）

子表 `filterItems` 只有 `input` | `select` | `date`，选项字段叫 `options`。提交在 `onQuery` 的 `data.cond`。详见 [main-sub-table.md](main-sub-table.md)。
