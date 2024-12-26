---
title: 导入
order: 5
toc: content
---

## 导入 ImportModal

根据导入建立导入任务，在导入导出任务中心菜单下载文件。

## `使用`

```ts
// index
import { ImportModal } from 'egenie-uitls'; // or from 'egenie-components'

<ImportModal store={importModel} promptChildren={<div>注意事项</div>}/>;

// store
import { ImportModel } from 'egenie-uitls'; // or from 'egenie-components'

this.importModel = new ImportModel();
this.importModel.openModal({
    sheetName: string,
    importConditionGroup?:[
      {
        title: string;
        key: string;
        value?: boolean;
        explain?: string | ReactNode;
        onChangeCallback?: (key: string,checked:boolean) => void;
      }
    ]
});
```

### `传参`

#### `promptChildren?:ReactNode`

导入时额外提示的信息(样式以及是否显示由外部自行控制)

#### `sheetName: string`

表名(找后端要)， string 类型。

#### `importConditionGroup: array`

```ts
该参数主要针对个别需要对导入进行条件限制的
key：（问后端要）
title: 标题
onChangeCallback：开关回掉
explain：提示信息
value: 指定当前是否选中
```

#### `导入导出任务中心`

代码在 egenie-ts-baseinfo，入口在 ERP 页面右上角(头像右击)菜单中
