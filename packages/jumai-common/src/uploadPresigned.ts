/**
 * 基于预签名 URL 的文件上传/下载工具。
 *
 * 上传流程：
 * 1. 调用后端 getPresignedUrl 接口，传入 UploadData + fileName，获取 presignedUrl 与 obsUrl
 * 2. 前端对 presignedUrl 发起 PUT 请求，将文件直传至自建对象存储
 * 3. 业务侧使用 obsUrl 作为文件最终访问地址
 *
 * 对外暴露的方法名与入参与 upload.ts 保持一致，便于业务侧无缝切换。
 */
import { message } from 'antd';
import type { BaseData, BatchReportData } from './request';
import { request } from './request';
import { getUUID } from './print';

export type {
  UploadData,
  UploadExtendParam,
  UploadFileItem,
} from './upload';

import type { UploadData, UploadExtendParam, UploadFileItem } from './upload';

/** 后端 getPresignedUrl 接口返回的数据结构 */
interface PresignedUrlData {
  presignedUrl: string; // 带验签信息的临时上传地址，前端 PUT 文件时使用
  obsUrl: string; // 上传完成后业务侧使用的文件访问地址
  validated?: boolean; // 空间校验是否通过，false 时 result 可能有失败详情
  result?: BatchReportData['data']; // 空间校验失败时的批量报告信息
}

/** 请求预签名 URL 时的入参，在 UploadData 基础上增加文件名 */
interface GetPresignedUrlPayload extends UploadData {
  fileName: string;
}

/**
 * 从接口响应中解析 PresignedUrlData。
 * 兼容 data 嵌套（res.data.presignedUrl）与平铺（res.presignedUrl）两种结构。
 */
function extractPresignedUrlData(res: unknown): PresignedUrlData {
  if (!res || typeof res !== 'object') {
    throw '上传失败！请联系管理员或重新上传';
  }

  const obj = res as Record<string, unknown>;
  const nested = obj.data;
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>;
    if (inner.presignedUrl || inner.obsUrl) {
      return inner as unknown as PresignedUrlData;
    }
  }

  if (obj.presignedUrl || obj.obsUrl) {
    return obj as unknown as PresignedUrlData;
  }

  throw '上传失败！请联系管理员或重新上传';
}

/**
 * 生成上传用的唯一文件名，规则与原 upload.ts 一致。
 * @param fileName 原始文件名
 */
function getFileName(fileName: string): string {
  return `${getUUID()}_${fileName.replace(/,|，| |/g, '')}`;
}

/**
 * 获取预签名上传地址（免登录校验）
 * @param data UploadData + fileName
 */
const getPresignedUrlAnon = async (
  data: GetPresignedUrlPayload,
): Promise<PresignedUrlData> => {
  const res = await request<BaseData<PresignedUrlData>>({
    url: '/api/goodsPic/rest/anon/policy/getPresignedUrl',
    method: 'POST',
    data,
  });
  return extractPresignedUrlData(res?.data ?? res);
};

/**
 * 获取预签名上传地址（需登录校验）
 * @param data UploadData + fileName
 */
const getPresignedUrl = async (
  data: GetPresignedUrlPayload,
): Promise<PresignedUrlData> => {
  const res = await request<BaseData<PresignedUrlData>>({
    url: '/api/goodsPic/rest/policy/getPresignedUrl',
    method: 'POST',
    data,
  });
  return extractPresignedUrlData(res?.data ?? res);
};

/**
 * 根据 extendParam.isAnon 选择接口，获取并校验预签名数据。
 *
 * 校验规则：只要 presignedUrl 与 obsUrl 均存在即视为可上传。
 * 后端可能在 validated=false 时仍返回 URL（例如未传空间校验 params 的场景），此时不拦截上传。
 * 仅当两个 URL 均缺失时，才触发 validatedCb 并抛出错误。
 *
 * @param data 上传校验参数
 * @param fileName 已处理过的唯一文件名
 * @param extendParam 额外参数，isAnon 决定走匿名还是登录接口
 */
const resolvePresignedUrl = async (
  data: UploadData,
  fileName: string,
  extendParam?: UploadExtendParam,
): Promise<PresignedUrlData> => {
  const payload: GetPresignedUrlPayload = {
    ...data,
    fileName,
  };
  const presignedData = extendParam?.isAnon
    ? await getPresignedUrlAnon(payload)
    : await getPresignedUrl(payload);

  const hasUploadUrl = Boolean(
    presignedData.presignedUrl && presignedData.obsUrl,
  );

  if (hasUploadUrl) {
    return presignedData;
  }

  if (presignedData.validated === false && presignedData.result) {
    extendParam?.validatedCb?.(presignedData.result);
  }
  throw '上传失败！请联系管理员或重新上传';
};

/**
 * 使用预签名 URL 将文件 PUT 至对象存储。
 * 需要进度回调时使用 XHR（支持 upload.onprogress），否则使用 fetch。
 *
 * @param file 待上传文件
 * @param presignedUrl 后端返回的临时上传地址
 * @param onProgress 上传进度回调，传入 0~1 之间的小数
 */
async function putUpload(
  file: Blob | File,
  presignedUrl: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  if (onProgress) {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader(
        'Content-Type',
        file.type || 'application/octet-stream',
      );
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded / event.total);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }
        reject(new Error('upload failed'));
      };
      xhr.onerror = () => reject(new Error('upload failed'));
      xhr.send(file);
    });
    return;
  }

  const res = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });
  if (!res.ok) {
    throw new Error('upload failed');
  }
}

/**
 * 单文件预签名上传的完整流程：取预签名 → PUT 上传 → 返回 obsUrl。
 *
 * @param data 上传校验参数
 * @param file 待上传文件
 * @param rawFileName 原始文件名（会经 getFileName 处理后传给后端）
 * @param extendParam 额外参数
 * @param options 生命周期回调：beforeUpload / onProgress / afterUpload
 * @returns 上传成功后的 obsUrl
 */
const uploadByPresignedUrl = async (
  data: UploadData,
  file: Blob | File,
  rawFileName: string,
  extendParam?: UploadExtendParam,
  options?: {
    onProgress?: (progress: number) => void;
    beforeUpload?: () => void;
    afterUpload?: (obsUrl: string) => void;
  },
): Promise<string> => {
  const fileName = getFileName(rawFileName);
  options?.beforeUpload?.();
  const { presignedUrl, obsUrl } = await resolvePresignedUrl(
    data,
    fileName,
    extendParam,
  );

  try {
    await putUpload(file, presignedUrl, options?.onProgress);
    options?.afterUpload?.(obsUrl);
    return obsUrl;
  } catch {
    throw '上传失败！请联系管理员或重新上传';
  }
};

/**
 * 单个普通上传
 * @param data 校验参数
 * @param file 上传文件
 * @param extendParam 额外的参数，fileName 用于 blob 场景保留原始文件名
 * @returns 上传成功后的 obsUrl
 */
export const singleUpload = async (
  data: UploadData,
  file: File | Blob,
  extendParam?: UploadExtendParam,
): Promise<string> => {
  const rawName = extendParam?.fileName || (file as File).name;
  return uploadByPresignedUrl(data, file, rawName, extendParam);
};

/**
 * 单个上传（原分片上传入口，现改为预签名 PUT 上传，保留此方法名以兼容业务调用）
 * @param data 校验参数
 * @param file 上传文件项
 * @param extendParam 额外参数，支持 progressCb / beforeUploadCb / completeUploadCb
 * @returns 上传成功后的 obsUrl
 */
export const singlePartUpload = async (
  data: UploadData,
  file: UploadFileItem,
  extendParam?: UploadExtendParam,
): Promise<string> => {
  return uploadFileItem(data, file, extendParam);
};

/**
 * 批量上传（循环调用预签名 PUT，不再分片）
 * @param data 校验参数
 * @param fileList 待上传文件列表
 * @param extendParam 额外参数
 * @returns 与 fileList 顺序对应的上传结果 URL 数组，失败项为空字符串
 */
export const multipartUpload = async (
  data: UploadData,
  fileList: UploadFileItem[],
  extendParam?: UploadExtendParam,
): Promise<string[] | string> => {
  const promiseList: Array<Promise<string>> = [];
  for (let i = 0; i < fileList.length; i++) {
    promiseList.push(uploadFileItem(data, fileList[i], extendParam));
  }
  return PromiseAll(promiseList);
};

/**
 * 上传单个 UploadFileItem，并触发 extendParam 中的批量上传回调。
 * @param data 校验参数
 * @param file 上传文件项
 * @param extendParam 额外参数
 */
const uploadFileItem = async (
  data: UploadData,
  file: UploadFileItem,
  extendParam?: UploadExtendParam,
): Promise<string> => {
  return uploadByPresignedUrl(data, file.blob, file.name, extendParam, {
    beforeUpload: () => extendParam?.beforeUploadCb?.(file),
    onProgress: (progress) => extendParam?.progressCb?.(progress, file),
    afterUpload: (obsUrl) => extendParam?.completeUploadCb?.(obsUrl, file),
  });
};

/**
 * 通过隐藏 a 标签触发浏览器下载。
 * @param url 文件访问地址
 * @param fileName 下载保存时的文件名
 */
const downLoad = (url: string, fileName?: string) => {
  const downloadLink = document.createElement('a');
  downloadLink.style.display = 'none';
  downloadLink.download = fileName || 'download';
  downloadLink.href = url;
  url ? downloadLink.click() : message.error('下载图片链接不存在');
};

/**
 * 单个文件下载（直接使用 url 下载，不再走 OBS/OSS SDK 签名）
 * @param data 保留入参以兼容原调用，当前未使用
 * @param url 文件访问地址
 * @param extendParam 额外参数，fileName 可指定下载文件名
 */
export const singleDownload = async (
  _data: UploadData,
  url: string,
  extendParam?: UploadExtendParam,
) => {
  let fileName = extendParam?.fileName;
  if (!fileName) {
    try {
      fileName = decodeURI(
        new URL(url).pathname.split('/').pop() || 'download',
      );
    } catch {
      fileName = decodeURI(url.split('/').pop() || 'download');
    }
  }
  downLoad(url, fileName);
};

/**
 * 串行执行上传 Promise 列表，单个失败不影响其余文件，失败项记为空字符串。
 * 逻辑与原 upload.ts 的 PromiseAll 保持一致。
 * @param iterator 上传 Promise 数组
 */
const PromiseAll = (iterator: Array<Promise<string>>): Promise<string[]> => {
  const promises = Array.from(iterator);
  const len = promises.length;
  const result: string[] = [];
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: 保持与原 upload.ts 一致的串行容错逻辑
  return new Promise(async (resolve) => {
    for (let i = 0; i < promises.length; i++) {
      await promises[i]
        .then((res) => {
          result[i] = res;
          if (i + 1 === len) {
            resolve(result);
          }
        })
        .catch(() => {
          result[i] = '';
          if (i + 1 === len) {
            resolve(result);
          }
        });
    }
  });
};
