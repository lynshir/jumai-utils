# 主子表、按钮、汇总

`MainSubStructure` 从上到下：`collectData`（可选）→ `buttons`（可选）→ 主表 → 拖拽条 + 子表 Tab（`hiddenSubTable !== true`）。

左右页里这些都在 `Programme` 右侧；上下页在表格区域。不要把按钮写到查询条件行里。

## 仅主表

```ts
hiddenSubTable: true
```

## 主表按钮 `buttons: IButton[]`

```ts
buttons: [
  { text: '新增', handleClick: () => this.openAdd() },
  { text: '导出', permissionId: 'export', handleClick: () => this.onExport() },
  {
    text: '更多',
    type: 'dropdown',
    group: [
      { text: '作废', handleClick: () => this.onVoid() },
    ],
  },
]
```

| 字段 | 说明 |
|---|---|
| `text` | 必填 |
| `handleClick` | 必填 |
| `permissionId` | 有权限体系时填；配了 `pageId` 且 id 不含 `_` 时会拼成 `${pageId}_${permissionId}` |
| `display` | `(rows?) => boolean` 控制显隐 |
| `disabled` | 禁用 |
| `isRight` | 靠右 |
| `type` | `'dropdown'` 下拉组 / `'icon'` 图标按钮 |
| `group` | 按钮组 |
| `icon` | 图标 class |
| `pageId` | 配在 `MainSubStructureModel` 上，用来拉按钮权限 |

按钮左侧提示用 `btnExtraLeft`；按钮行最右侧自定义节点用 `btnExtraRight`。

行内操作写在列 `formatter`，需要权限时包 `<Permission permissionId="...">`。

## 汇总 `collectData`（按钮上方）

```ts
collectData: [
  { name: '总数量', value: 0 },
  { name: '总金额', value: 0, color: '#ff4d4f' },
]
```

接口回来后直接改 `this.programme.gridModel.collectData = [...]`（或 SearchList 的 `this.searchListStore.grid.collectData`）。

表尾合计用表格配置，不是 `collectData`：

- `summaryRows`：表尾汇总行
- `sumColumns`：指定列求和（可 `{ key, name, tag: 'price' | 'number', decimal }`）
- `onSelectSum`：按勾选行汇总
- `searchReduce` + `searchReduceConfig`：查询结果汇总条

## 子表 `subTables`

去掉 `hiddenSubTable`。`tabsFlag.inited` 里把默认 Tab 设为 `true`。

```ts
subTables: {
  activeTab: 'detail',
  tabsFlag: { inited: { detail: true }, searched: {} },
  list: [{
    tab: { name: '明细', value: 'detail' },
    // 子表按钮必须是函数
    buttons: (subTable) => [{
      text: '导出明细',
      handleClick: () => this.exportDetail(subTable),
    }],
    allFilterItemsInOneGroup: true, // true=多项一起展示；false=下拉切换一项
    filterItems: [                    // 仅支持 input | select | date
      { label: '档口', field: 'shopName', type: 'input', value: '' },
      { label: '订单号', field: 'orderNo', type: 'input', value: '' },
    ],
    grid: {
      primaryKeyField: 'id',
      columns: [],
      rows: [],
      showCheckBox: false,
      sortByLocal: false,
      setColumnsDisplay: true,
      gridIdForColumnConfig: 'uniqueSubGridId',
      showPager: true,          // 无分页则 false，且 onQuery 返回 data 为数组
      showPagination: true,
      showNormalEmpty: true,
    },
    api: {
      onQuery: ({ data, cursorRow, pid }) => {
        return request({
          url: '/api/.../detail',
          method: 'post',
          data: {
            parentId: cursorRow?.id ?? pid,
            ...data?.cond, // 子表查询项在 cond 里
          },
        });
      },
    },
  }],
}
```

要点：

- 子表 `buttons` **必须是** `(subTable) => IButton[]`，不能是数组。
- 点主表行会带 `cursorRow` / `pid` 自动查当前 Tab；无主键时子表会被清空。
- 子表查询项只有 `input` | `select` | `date`。`select` 的选项字段是 `options`，不是 `data`。
- 有分页：`showPager: true`，返回 `PaginationData`（`data.list` + `data.totalCount`）。
- 无分页：`showPager: false`，`onQuery` 返回 `{ status: 'Successful', data: Row[] }`（`data` 直接是数组）。
- 自定义非表格子表：`isCustom: true` + `customView`。
- 刷新当前子表：`mainSubStructureModel.subTablesModel.cursorTabModel.onRefresh()`。

## 主表 grid 常用项

| 字段 | 建议 |
|---|---|
| `primaryKeyField` | 必填 |
| `columns` | `{ key, name, width, resizable: true }`；操作列 `formatter: ({ row }) => ...` |
| `showCheckBox` | 需要勾选才 true |
| `sortByLocal` | 服务端排序用 `false` |
| `setColumnsDisplay` + `gridIdForColumnConfig` | 要列设置/拖拽时一起开，id 唯一 |
| `showEmpty` / `showNormalEmpty` / `showNoSearchEmpty` | 空态；主表查询后无数据会切到 `showNormalEmpty` |
| `showSelectedTotal` / `showReset` / `showRefresh` | 底栏勾选统计 / 重置 / 刷新 |
| `showGridOrderNo` | 序号列 |

主表 `api.onQuery(params)` 的 `params` 含 `filterParams`、`page`、`pageSize`、`sidx`、`sord`。必须 `const { filterParams, ...rest } = params` 后再 POST。

## 权限未配时

没接按钮权限就不要填 `pageId`，或让 `permissionOfButton` 保持空：无 `permissionId` 的按钮会显示；填了 `permissionId` 但权限列表为空会被滤掉。
