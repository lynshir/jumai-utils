# 其它 jumai-utils 组件

业务侧能用封装就用封装。下面都从 `jumai-utils` import。

## FullModal（全屏弹窗）

用户说「全屏弹窗」一律用它，不要 antd `Modal`，不要自写遮罩。

```tsx
import { FullModal } from 'jumai-utils';

<FullModal
  visible={visible}
  title="标题"
  onCancel={close}
  // style={{ left: 0 }}           // 需要贴左
  // operation={<>右侧操作</>}      // 标题栏右侧
>
  {children}
</FullModal>
```

Props：`visible`、`title`、`onCancel`、`style`、`operation`、`children`、`titleClassName`。

普通确认/提示仍可用 antd `Modal.confirm` / `message`。

## 导出 ExportStore + ExportModal

```tsx
import { ExportModal, ExportStore } from 'jumai-utils';

exportStore = new ExportStore({ parent: this });

onExport = () => {
  const selectedIds = Array.from(this.programme.gridModel.gridModel.selectedIds).join(',');
  this.exportStore.onShow(
    '文件名',
    'exportType',          // 后端模板类型
    selectedIds,
    this.programme.filterItems.params,
    this.programme.filterItems.translateParams.join(' '),
  );
};

// index.tsx
<ExportModal store={store.exportStore} />
```

`onShow(fileName, exportType, selectedIds, queryParam?, queryParamShow?, params?, showMergeFlag?, mergeFlag?, isAllowAddTemplate?)`。

## 导入 ImportModel + ImportModal

```tsx
import { ImportModal, ImportModel } from 'jumai-utils';
```

按当前项目已有导入页抄用法；不要新写一套上传弹窗。文件上传走 `jumai-common` 的 `multipartUpload({ obsConfigId }, files)`，业务接口只传 `fileUrl` + `fileName`。

## 权限

```tsx
import { Permission, usePermission, hasPermission, getPerms } from 'jumai-utils';

<Permission permissionId="221600_44">
  <a onClick={...}>编辑</a>
</Permission>
```

主/子表工具栏按钮用 `pageId` + 按钮 `permissionId`，不要每个按钮再包一层 `Permission`（工具栏会自己滤）。行内操作才用 `<Permission>`。

## 表格单元格

```tsx
import { ImgFormatter, TimeStampFormatter } from 'jumai-utils';

{ key: 'pic', name: '图片', formatter: ({ row }) => <ImgFormatter value={row.pic} width={76} height={76} /> }
{ key: 'createdAt', name: '时间', formatter: ({ row }) => <TimeStampFormatter value={row.createdAt} /> }
```

## 图片预览 ImagePreviewModal

```tsx
<ImagePreviewModal
  visible={visible}
  onCancel={close}
  images={['url1', 'url2']}
  current={0}
/>
```

## 批量结果 BatchReport

批量接口返回 `BatchReportData` 后，用 `BatchReport` 展示成功/失败列表（含复制）。不要自己写结果表格弹窗。

## 请求与类型

```ts
import { request } from 'jumai-utils';
import type { BaseData, PaginationData } from 'jumai-utils';

request<PaginationData<Row>>({ url, method: 'post', data }); // 列表：data.list / data.totalCount
request<BaseData<Row>>({ url, method: 'post', data });       // 非分页
```

成功判断跟当前项目一致（常见 `res.status === 'Successful'`）。

## 纯表格 / 主子表（无查询方案）

- 纯表格：`EgGridModel` + `EgGrid`
- 无左侧/顶部方案的主子表：`MainSubStructureModel` + `MainSubStructure`

有查询条件时不要只用这两套，应走 Programme / SearchListStructure / NormalProgramme。

## TabsProgramme

上下结构且筛选上方需要状态 Tab：`TabsProgramme` + `NormalProgramme`，`tabsToParams` 写成字段名或函数，Tab 值会并进 `filterItems.params`。也可用业务自己的 Tab，再在切换时 `updateFilterItem` + `onQuery`。
