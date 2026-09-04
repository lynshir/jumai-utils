# 列表页布局模板

`index.tsx` 用 `observer`。store 用 class + MobX。`moduleName` / `gridIdForColumnConfig` 按页面写唯一值。

## 1. 左右结构（最常用）

左侧查询方案 + 右侧 `MainSubStructure`（按钮、汇总、主表、子表都在右侧）。

```tsx
// index.tsx
import { ProgrammeComponent } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import { PageStore } from './store';

export default observer(() => {
  const [store] = React.useState(() => new PageStore());
  return <ProgrammeComponent store={store.programme} />;
});
```

```tsx
// store.tsx
import type { IMainSubStructureModel, PaginationData } from 'jumai-utils';
import { MainSubStructureModel, Programme, request } from 'jumai-utils';

export class PageStore {
  public programme: Programme;

  public constructor() {
    this.programme = new Programme({
      moduleName: 'uniqueModuleName', // 必填，方案缓存 key
      showProgrammeCount: true,       // 需要方案角标时再开
      gridModel: new MainSubStructureModel(this.gridConfig),
      filterItems: [
        { type: 'input', label: '单号', field: 'orderNo', isMultipleSearch: true },
        { type: 'select', label: '状态', field: 'status', mode: 'multiple', data: [] },
        {
          type: 'dateRange',
          label: '创建时间',
          field: 'createdAt',
          format: 'YYYY-MM-DD',
          formatParams: 'YYYY-MM-DD',
          startParamsField: 'createTimeStart',
          endParamsField: 'createTimeEnd',
        },
      ],
    });
  }

  private readonly gridConfig: IMainSubStructureModel = {
    pageId: '', // 有按钮权限时填资源 pageId
    buttons: [{ text: '导出', handleClick: () => this.onExport() }],
    hiddenSubTable: true, // 有子表则删掉这行，改配 subTables，见 main-sub-table.md
    grid: {
      primaryKeyField: 'id',
      columns: [/* { key, name, width, resizable: true, formatter? } */],
      rows: [],
      showCheckBox: true,
      sortByLocal: false,
      showEmpty: true,
      setColumnsDisplay: true,
      gridIdForColumnConfig: 'uniqueGridId',
    },
    api: {
      onQuery: (params) => {
        const { filterParams, ...rest } = params;
        return request<PaginationData>({
          url: '/api/.../page',
          method: 'post',
          data: { ...filterParams, ...rest },
        });
      },
    },
  };

  private onExport = () => { /* 见 other-components.md */ };
}
```

`Programme` 的 `gridModel` **必须是** `new MainSubStructureModel(...)`，不能传裸配置对象。

## 2. 上下结构 · 仅主表

顶部横向筛选 + 下方主表。`SearchListStructure` 内部会强制 `hiddenSubTable: true`。

```tsx
// index.tsx
import { SearchListStructure } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import { PageStore } from './store';

export default observer(() => {
  const [store] = React.useState(() => new PageStore());
  return <SearchListStructure store={store.searchListStore} />;
});
```

```tsx
// store.tsx
import type { IMainSubStructureModel, NormalProgrammeParams, PaginationData } from 'jumai-utils';
import { request, SearchListModal } from 'jumai-utils';

export class PageStore {
  public filterset: Partial<NormalProgrammeParams> = {
    count: 5, // 一行几个查询项
    moduleName: 'uniqueModuleName', // 需要记住显隐/顺序时再填
    filterItems: [
      { type: 'input', label: '单号', field: 'orderNo' },
      {
        type: 'dateRange',
        label: '时间',
        field: 'dateRange',
        format: 'YYYY-MM-DD',
        formatParams: 'YYYY-MM-DD',
        startParamsField: 'startTime',
        endParamsField: 'endTime',
        allowClear: true,
      },
    ],
  };

  public grid: IMainSubStructureModel = {
    buttons: [{ text: '新增', handleClick: () => this.openAdd() }],
    hiddenSubTable: true,
    grid: {
      primaryKeyField: 'id',
      columns: [],
      rows: [],
      showCheckBox: true,
      sortByLocal: false,
      showEmpty: true,
    },
    api: {
      onQuery: (params) => {
        const { filterParams, ...rest } = params;
        return request<PaginationData>({
          url: '/api/.../page',
          method: 'post',
          data: { ...filterParams, ...rest },
        });
      },
    },
  };

  public searchListStore = new SearchListModal({
    programme: this.filterset,
    grid: this.grid,
  });

  private openAdd = () => { /* FullModal，见 other-components.md */ };
}
```

顶部再加业务 Tab 时：Tab 放在 `SearchListStructure` 外面，用 `style={{ height: 'calc(100% - Tab高度)' }}`，Tab 切换里 `updateFilterItem` + `grid.gridModel.onQuery()`。

## 3. 上下结构 · 带主子表

不要用 `SearchListStructure`。自己把筛选和主子表拼起来，并接上查询参数：

```tsx
// index.tsx
import { MainSubStructure, NormalProgrammeComponent } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import { PageStore } from './store';

export default observer(() => {
  const [store] = React.useState(() => new PageStore());
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NormalProgrammeComponent store={store.programme} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <MainSubStructure store={store.grid} />
      </div>
    </div>
  );
});
```

```tsx
// store.tsx 关键接线
this.grid = new MainSubStructureModel({ /* 含 subTables，不要 hiddenSubTable */ });
this.programme = new NormalProgramme({
  count: 5,
  filterItems: [/* ... */],
  handleSearch: () => this.grid.onQuery(),
});
this.grid.getFilterParams = () => this.programme.filterItems.params;
```

## 4. 弹窗内筛选

弹窗/抽屉里只用横向筛选：`NormalProgramme` + `NormalProgrammeComponent`，`handleSearch` 指到弹窗内表格的 `onQuery`。全屏层用 `FullModal`，不要 antd `Modal`。

## 不要做的事

- 不要用 `flex` + 自写 Form 仿左侧方案栏（那就是 `Programme`）。
- 不要在 `ProgrammeComponent` 外包一层自己的左右 layout。
- 不要把 `SearchListStructure` 用于带子表的上下页。
- 不要漏 `moduleName`（`Programme` 构造会直接 throw）。
