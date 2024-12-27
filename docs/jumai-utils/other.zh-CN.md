---
title: 其他
order: 4
toc: content
---

## 批量报告

- columns 就是 antd-Table 的配置。目前只支持`dataIndex`、`title`、`width`、`align`

```ts
import { renderModal, BatchReportData, request } from 'jumai-common';
import { BatchReport } from 'jumai-utils';
import React from 'react';

request<BatchReportData>({
  url: 'path',
  method: 'POST',
}).then((res) => {
  renderModal(
    <BatchReport
      {...res.data}
      columns={[
        {
          title: '收货单编号',
          dataIndex: 'serialNo',
        },
        {
          title: '失败原因',
          dataIndex: 'reason',
        },
      ]}
    />,
  );
});
```
