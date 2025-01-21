---
title: 导出
order: 1
toc: content
---

## 导出 ExportModal

根据导出模板与查询参数建立导出任务，在导出任务中心菜单下载文件。

注意：主表和子表不可同时导出。

## `使用`

```ts
// index
import { ExportModal } from 'egenie-uitls'; // or from 'egenie-components'

<ExportModal store={store.exportStore} />;

// store
import { ExportStore } from 'egenie-uitls'; // or from 'egenie-components'

this.exportStore = new ExportStore({ parent: this }); //parent 参数为可选参数
this.exportStore.onShow(fileName, exportType, mainTableIds, queryParam, queryParamTranslate, otherParams);
```

### `传参`

#### `fileName: string`

文件名， string 类型。

#### `exportType: string`

导出类型，string 类型。 对应后端 sheetName。

#### `mainTableIds: string`

主表所选中的 ids，以逗号分隔的 string 类型。

若导出子表，则传主表当前行 id；若导出主表全部，传空

#### `queryParam: object`

主表查询条件，object 类型。

根据后端要求是放在 queryParam 还是 otherParams 中。一般 ts 项目放在 otherParams，js 项目放在 queryParam。

#### `queryParamTranslate: string`

主表查询条件 的中文翻译，以空格分隔的 string 类型。

#### `otherParams: object`

其他参数。根据后端要求传参。

若导出子表，则包含子表 ids，字段名需与后端约定。

#### `showMergeFlag: boolean`

是否显示“合并单元格”开关。

#### `mergeFlag: boolean`

设置合并单元格的默认值。

### `导出成功的回调`

- 与 new ExportStore({ parent: this }) 配合使用。

```
exportCallBack = () => {
  //...
};

```

## `示例`

- 使用组件库中的查询条件&表格 SearchListStructure

```ts
exportFunc = (): void => {
  const selectIds = this.searchListStore.grid.grid.selectedIds; //被选中的id数组
  const queryParam = this.searchListStore.programme.filterItems.params; //获取查询条件
  const queryParamShow = this.searchListStore.programme.filterItems.translateParams; //获取查询条件中文值
  if (selectIds.length === 0) {
    Modal.confirm({
      title: '提示',
      content: '未选择数据将导出全部数据?',
      onOk: () => {
        this.exportStore.onShow('选款订单导出', 'mall_sale_order_detail', '', queryParam, queryParamShow.join(' ')); // ids不传即代表导出全部数据
      },
    });
    return;
  }
  this.exportStore.onShow('选款订单导出', 'mall_sale_order_detail', selectIds.join(','), queryParam, queryParamShow.join(' ')); // 勾选部分数据
};
```

- 仅使用组件库中的查询条件 NormalProgrammeComponent，表格自定义

```ts
exportFunc = (): void => {
  const selectIds = this.selectedIds; //被选中的id数组
  const queryParam = this.programme.filterItems.params; //获取查询条件
  const queryParamShow = this.programme.filterItems.translateParams; //获取查询条件中文值
  if (selectIds.length === 0) {
    Modal.confirm({
      title: '提示',
      content: '未选择数据将导出全部数据?',
      onOk: () => {
        this.exportStore.onShow('选款订单导出', 'mall_sale_order_detail', '', queryParam, queryParamShow.join(' ')); // ids不传即代表导出全部数据
      },
    });
    return;
  }
  this.exportStore.onShow('选款订单导出', 'mall_sale_order_detail', selectIds.join(','), queryParam, queryParamShow.join(' ')); // 勾选部分数据
};
```

## `egenie-components`

- 适用于 js 老项目

```js
/**
 * 新版导出（导出任务中心下载文件）
 * @filterset 当前查询方案
 * @exportType 导出类型，找后端确定
 * @fileName 文件名，中文
 * @checkSubTable 是否勾选子表导出, 用于校验
 * @allExport 是否需要做不勾选全部导出判断
 */
exportFunc = (filterset, exportType, fileName, checkSubTable = true, allExport = true) => {
  const purchaseIds = filterset.gridModel.selectedKeyValues.slice();
  const subDetailIds = filterset.subTablesModel.cursorTabModel.gridModel.selectedKeyValues.slice();
  const queryParam = this.getCurrentCondition(); //获取查询条件值
  if (queryParam.started || queryParam.ended) {
    //根据日期查询条件选择性写这一段
    queryParam.dateValue = `${queryParam.started || ''},${queryParam.ended || ''}`;
    delete queryParam.started;
    delete queryParam.ended;
  }
  const labelAndValues = this.getCurrentConditionText(); //获取查询中文条件值,并做些处理
  const queryParamShow = [];
  Object.keys(labelAndValues).forEach((key) => {
    if (Array.isArray(labelAndValues[key])) {
      queryParamShow.push(`${key}:${labelAndValues[key].join(',')}`);
    } else {
      queryParamShow.push(`${key}:${labelAndValues[key]}`);
    }
  });

  if (checkSubTable && purchaseIds.length > 0 && subDetailIds.length > 0) {
    return message.info('请只勾选主表或只勾选子表导出');
  }
  if (purchaseIds.length === 0 && subDetailIds.length === 0) {
    if (allExport) {
      Modal.confirm({
        title: '提示',
        content: '未选择数据将导出全部数据?',
        onOk: () => {
          this.exportStore.onShow(fileName, exportType, '', queryParam, queryParamShow.join(' ')); // ids传空即代表导出全部数据
        },
      });
      return;
    }
    return message.info('请勾选数据导出');
  }
  let params = {};
  let ids = purchaseIds.join(',');
  if (subDetailIds.length > 0) {
    ids = filterset.gridModel.cursorRow.pms_purchase_order_id;
    params.ids = subDetailIds.join(','); //其他参数封装到params中，包括子表ids（ids为前后端约定的字段名）
  }
  this.exportStore.onShow(fileName, exportType, ids, queryParam, queryParamShow.join(' '), params); //勾选部分数据
};
```

## `补充`

#### `导出相关接口`

```js
'/api/boss/baseinfo/rest/export/template/config/list', // 导出模板列表查询
'/api/boss/baseinfo/rest/export/template/config/save', // 导出模板保存
'/api/boss/baseinfo/rest/export/template/config/delete', // 删除导出模板
'/api/boss/baseinfo/rest/export/column/config/list', // 配置模板字段列表 包括自定义属性
'/api/boss/baseinfo/rest/export/task/commit', // 提交导出
'/api/boss/baseinfo/rest/whiteList/export/config/getExportConfig', // 获取导出配置
```

#### `导出任务中心`

代码在 egenie-ts-baseinfo，入口在 ERP 页面右上角(头像右击)菜单中
