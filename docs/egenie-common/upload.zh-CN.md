---
title: 上传下载
order: 4
toc: content
---

# `上传下载`

> 参数说明

```ts
export interface UploadData {
  params?: Array<{ capacity: number; name: string; parentId: string }>; // 图片空间校验参数
  type?: number; // 上传文件类型 1.图片(默认)，2.视频
  obsConfigId: number; // 配置类型id
  callType?: number; // 调用云的方式: 1-SDK调用 2-API调用, 不传默认1
}

export interface UploadExtendParam {
  isAnon?: boolean; // 是否免校验
  fileName?: string; // 保留文件名，压缩后可能会成为blob,将会丢失文件名, 必须单独传
  beforeUploadCb?: (file: File | UploadFileItem) => Promise<void> | void; // 分片上传 上传单个文件前回调
  completeUploadCb?: (url: string, file: File | UploadFileItem) => Promise<void> | void; // 分片上传 上传单个文件成功后回调
  progressCb?: (progress: number, file: UploadFileItem) => Promise<void> | void; // 分片上传 上传进度回调
  validatedCb?: (res: BatchReportData['data']) => Promise<void> | void;
}

export interface UploadFileItem {
  blob: Blob | File;
  id: string | number;
  name: string;
}
```

## `单个图片上传`

> 示例

```ts
/**
 * 单个普通上传
 * @param data  UploadData 校验参数
 * @param file file|blob 上传文件
 * @param extendParam UploadExtendParam 额外的参数
 * @returns url: string
 */
import { singleUpload } from 'egenie-common';
singleUpload({ obsConfigId: 21 }, file, { fileName: 'test' });
```

## `单个分片上传`

> 示例

```ts
/**
 * 单个上传（分片上传）
 * @param data  UploadData 校验参数
 * @param file  UploadFileItem 上传文件
 * @param extendParam  UploadExtendParam 额外的参数
 * @returns url: string
 */
import { singlePartUpload } from 'egenie-common';
singlePartUpload({ obsConfigId: 21 }, { blob: file, fileName: 'test', id: id }, { progressCb: progressCb });
```

## `批量分片上传`

> 示例

```ts
/**
 * 批量上传（分片上传）
 * @param data  UploadData 校验参数
 * @param file  UploadFileItem 上传文件
 * @param extendParam  UploadExtendParam 额外的参数
 * @returns string[]  如果上传错误就是空字符串
 */
import { multipartUpload } from 'egenie-common';
multipartUpload({ obsConfigId: 21 }, { blob: file, fileName: 'test', id: id }, { progressCb: progressCb });
```

## `单个文件下载`

> 示例

```ts
/**
 * 单个文件下载
 * @param data UploadData 校验参数
 * @param url 文件路径
 * @param extendParam UploadExtendParam 额外的参数 重命名下载传fileName需要带扩展名（与下载文件扩展名一致）
 */
import { singleDownload } from 'egenie-common';
const url1 = 'https://hw-pic.ejingling.cn/TESTPOS/temporaryTourist/1690381427617-normalvideo.mp4?attname=123';
const url2 = '/TESTPOS/temporaryTourist/1665311239951.csv';
singleDownload({ obsConfigId: 21 }, url2, { fileName: '随机.csv' });
```
