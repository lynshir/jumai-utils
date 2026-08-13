/**
 * 基于预签名 URL 的自建桶上传工具（数据备份）。
 *
 * 主上传走华为云 upload.ts，返回业务使用的 URL；
 * 本模块在主上传成功后异步备份一份到自建桶，不向外返回 URL，仅打日志。
 *
 * 上传流程：
 * 1. 调用后端 getPresignedUrl 接口，传入 UploadData + fileName，获取 presignedUrl 与 obsUrl
 * 2. 前端对 presignedUrl 发起 PUT 请求，将文件直传至自建对象存储
 * 3. 备份成功后 console.log 自建桶 obsUrl（不作为业务返回值）
 */
import type { BaseData, BatchReportData } from './request';
import { request } from './request';
import type { UploadData, UploadExtendParam } from './upload';

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
 * 将文件备份上传至自建桶（预签名 PUT）。
 * 使用与主上传相同的 fileName，便于对照；失败只打日志，不影响主流程。
 *
 * @param data 上传校验参数（与主上传一致，isAnon 走 extendParam）
 * @param file 待备份文件
 * @param fileName 已与主上传对齐的唯一文件名（勿再二次 getFileName）
 * @param extendParam 额外参数，主要用于 isAnon
 */
export const backupUploadToSelfHosted = async (
  data: UploadData,
  file: Blob | File,
  fileName: string,
  extendParam?: UploadExtendParam,
): Promise<void> => {
  try {
    // 备份仅复用 isAnon，不触发主流程的 validatedCb / completeUploadCb 等回调
    const backupExtendParam: UploadExtendParam | undefined = extendParam?.isAnon
      ? { isAnon: true }
      : undefined;
    const { presignedUrl, obsUrl } = await resolvePresignedUrl(
      data,
      fileName,
      backupExtendParam,
    );
    await putUpload(file, presignedUrl);
    console.log('[backupUpload] 已备份至自建桶', obsUrl);
  } catch (err) {
    console.warn('[backupUpload] 自建桶备份失败', fileName, err);
  }
};

/**
 * 异步触发自建桶备份，不阻塞主上传返回。
 */
export const triggerBackupUpload = (
  data: UploadData,
  file: Blob | File,
  fileName: string,
  extendParam?: UploadExtendParam,
): void => {
  void backupUploadToSelfHosted(data, file, fileName, extendParam);
};
