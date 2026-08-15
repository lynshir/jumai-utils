import type { BaseData, BatchReportData } from './request';
import { request } from './request';
import { message } from 'antd';
import { getUUID } from './print';
import { triggerBackupUpload } from './uploadPresigned';

interface CloudPolicy {
  aliCloudInfoVo?: AliCloudInfoVo;
  huaWeiCloudInfoVo: HuaWeiCloudInfoVo;
  activeType: number;
  validated: boolean;
  result?: any;
}

interface AliCloudInfoVo {
  accessKeyId: string;
  dir: string;
  host: string;
  region: string;
  accessKeySecret: string;
  token: string;
  endPoint: string;
  bucketName: string;
  validated: boolean;
  result?: any;
}

interface HuaWeiCloudInfoVo {
  access: string; // ak
  secret: string; // sk
  securitytoken: string; // 临时securitytoken
  endPoint: string;
  host: string;
  dir: string; // 目录
  bucketName: string;
}

export interface UploadFileItem {
  blob: Blob | File;
  id: string | number;
  name: string;
}

export interface UploadData {
  params?: Array<{ capacity: number;name?: string; parentId: string; }>; // 图片空间校验参数
  type?: number; // 上传文件类型 1.图片(默认)，2.视频
  obsConfigId: number; // 配置类型id
  callType?: number; // 调用云的方式: 1-SDK调用 2-API调用, 不传默认1
}

/**
 * 上传包含的额外信息
 * beforeUploadCb、completeUploadCb、progressCb、validatedCb 只在批量上传里用
 */
export interface UploadExtendParam {
  isAnon?: boolean; // 是否面校验
  fileName?: string; // 保留文件名，压缩后可能会成为blob,将会丢失文件名, 必须单独传
  beforeUploadCb?: (file: File | UploadFileItem) => Promise<void> | void; // 分片上传 上传单个文件前回调
  completeUploadCb?: (url: string, file: File | UploadFileItem) => Promise<void> | void;// 分片上传 上传单个文件成功后回调
  progressCb?: (progress: number, file: UploadFileItem) => Promise<void> | void; // 分片上传 上传进度回调
  validatedCb?: (res: BatchReportData['data']) => Promise<void> | void;
}

/**
 * 查询云临时校验信息（免校验接口）
 * @param data
 * @returns
 */
export const getUploadTokenAnon = async(data: UploadData): Promise<CloudPolicy> => {
  const res = await request<BaseData<CloudPolicy>>({
    url: '/api/goodsPic/rest/anon/policy/getALlCloudPolicy',
    method: 'POST',
    data,

  });
  return res?.data;
};

/**
 * 查询云临时校验信息（免图片管家校验）
 * @param data
 * @returns
 */
export const getUploadTokenWithOutCheck = async(data: UploadData): Promise<CloudPolicy> => {
  const res = await request<BaseData<CloudPolicy>>({
    url: '/api/goodsPic/rest/policy/getCloudPolicyWithOutCheck',
    method: 'POST',
    data,
  });
  return res?.data;
};

/**
 * 查询云临时校验信息（需要校验空间大小等信息 主要图片空间上传使用）
 * @param data
 * @returns
 */
export const getUploadToken = async(data: UploadData): Promise<CloudPolicy> => {
  const res = await request<BaseData<CloudPolicy>>({
    url: '/api/goodsPic/rest/policy/getALlCloudPolicy',
    method: 'POST',
    data,

  });
  return res?.data;
};

const getObsClient = async(hwObsPolicy: HuaWeiCloudInfoVo) => {
  const {
    access,
    secret,
    endPoint,
    securitytoken,
  } = hwObsPolicy;

  // @ts-ignore
  const OBS = await import('esdk-obs-browserjs');
  return new OBS.default({
    access_key_id: access,
    secret_access_key: secret,
    server: endPoint,
    security_token: securitytoken,
  });
};

const getOssClient = async(aliOssPolicy: AliCloudInfoVo) => {
  const {
    region,
    accessKeyId,
    accessKeySecret,
    bucketName,
    token,
  } = aliOssPolicy;

  // @ts-ignore
  const OSS = await import('ali-oss');
  return new OSS.default({
    region,
    accessKeyId,
    accessKeySecret,
    bucket: bucketName,
    stsToken: token,
  });
};

function getFileName(fileName: string): string {
  return `${getUUID()}_${fileName.replace(/,|，| |/g, '')}`;
}

/**
 * 单个普通上传
 * @param data 校验参数
 * @param file 上传文件
 * @param extendParam 额外的参数
 * @returns
 */
export const singleUpload = async(data: UploadData, file: File | Blob, extendParam?: UploadExtendParam) => {
  const policy = extendParam?.isAnon ? await getUploadTokenAnon(data) : data.obsConfigId === 3 ? await getUploadToken(data) : await getUploadTokenWithOutCheck(data);
  if (!policy.validated && policy.result) {
    extendParam.validatedCb && extendParam.validatedCb(policy.result);
    throw '上传失败！请联系管理员或重新上传';
  }
  const _name = extendParam?.fileName || (file as File).name;
  const fileName = getFileName(_name);
  if (policy.activeType === 1) {
    return singleUploadObs(policy.huaWeiCloudInfoVo, file, fileName, data, extendParam);
  } else {
    return singleUploadOss(policy.aliCloudInfoVo, file, fileName, data, extendParam);
  }
};

/**
 * 单个普通上传 阿里云
 * @param aliOssPolicy 临时秘钥
 * @param file 上传文件
 * @param fileName 文件名
 * @returns
 */
const singleUploadOss = async(
  aliOssPolicy: AliCloudInfoVo,
  file: File | Blob,
  fileName: string,
  data: UploadData,
  extendParam?: UploadExtendParam,
): Promise<string> => {
  try {
    const {
      dir,
      host,
    } = aliOssPolicy;
    const client = await getOssClient(aliOssPolicy);
    await client.put(`${dir}/${fileName}`, file);
    const url = `${host}/${dir}/${fileName}`;
    triggerBackupUpload(data, file, fileName, extendParam);
    return url;
  } catch (err) {
    throw '上传失败！请联系管理员或重新上传';
  }
};

/**
 * 单个普通上传 华为云
 * @param aliOssPolicy 临时秘钥
 * @param file 上传文件
 * @param fileName 文件名
 * @returns
 */
const singleUploadObs = async(
  hwObsPolicy: HuaWeiCloudInfoVo,
  file: File | Blob,
  fileName: string,
  data: UploadData,
  extendParam?: UploadExtendParam,
): Promise<string> => {
  try {
    const {
      host,
      dir,
      bucketName,
    } = hwObsPolicy;
    const obsClient = await getObsClient(hwObsPolicy);
    await obsClient.putObject({
      Bucket: bucketName,
      Key: `${dir}/${fileName}`,
      SourceFile: file,
    });
    const url = `${host}/${dir}/${fileName}`;
    console.log('url', url);
    triggerBackupUpload(data, file, fileName, extendParam);
    return url;
  } catch {
    throw '上传失败！请联系管理员或重新上传';
  }
};

/**
 * 单个上传（分片上传）
 * @param data
 * @param file
 * @param extendParam
 * @returns
 */
export const singlePartUpload = async(data: UploadData, file: UploadFileItem, extendParam?: UploadExtendParam): Promise<string> => {
  const policy = extendParam?.isAnon ? await getUploadTokenAnon(data) : data.obsConfigId === 3 ? await getUploadToken(data) : await getUploadTokenWithOutCheck(data);
  if (!policy.validated && policy.result) {
    extendParam.validatedCb && extendParam.validatedCb(policy.result);
    throw '上传失败！请联系管理员或重新上传';
  }
  if (policy.activeType === 1) {
    return multipartUploadObs(policy.huaWeiCloudInfoVo, file, data, extendParam);
  } else {
    return multipartUploadOss(policy.aliCloudInfoVo, file, data, extendParam);
  }
};

/**
 * 批量上传（分片上传）
 * @param data
 * @param fileList
 * @param extendParam
 * @returns  上传返回的信息，包含成功和失败 list
 */
export const multipartUpload = async(data: UploadData, fileList: UploadFileItem[], extendParam?: UploadExtendParam): Promise<string[] | string> => {
  const policy = extendParam?.isAnon ? await getUploadTokenAnon(data) : data.obsConfigId === 3 ? await getUploadToken(data) : await getUploadTokenWithOutCheck(data);
  if (!policy.validated && policy.result) {
    extendParam.validatedCb && extendParam.validatedCb(policy.result);
    throw '上传失败！请联系管理员或重新上传';
  }
  console.log('校验通过,准备上传...');
  const promiseList = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (policy.activeType === 1) {
      promiseList.push(multipartUploadObs(policy.huaWeiCloudInfoVo, file, data, extendParam));
    } else {
      promiseList.push(multipartUploadOss(policy.aliCloudInfoVo, file, data, extendParam));
    }
  }
  const res: string[] = await PromiseAll(promiseList);
  console.log('multipartUpload', res);
  return res;
};
const PromiseAll = (iterator: Array<Promise<string>>): Promise<string[]> => {
  const promises: any = Array.from(iterator); // 对传入的数据进行浅拷贝，确保有遍历器
  const len = promises.length; // 长度
  const data: string[] = []; // 用来存放返回的数据数组
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async(resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      await promises[i]
        .then((res: any) => {
          data[i] = res;
          if (i + 1 === len) {
            resolve(data);
          }
        })
        .catch(() => {
          data[i] = '';
          if (i + 1 === len) {
            resolve(data);
          }
        });
    }
  });
};

/**
 * 分段上传 阿里云
 * @param aliOssPolicy
 * @param file
 * @param fileName
 * @param progressCb 上传进度回调
 * @returns
 */
const multipartUploadOss = async(
  aliOssPolicy: AliCloudInfoVo,
  file: UploadFileItem,
  data: UploadData,
  extendParam?: UploadExtendParam,
): Promise<string> => {
  extendParam?.beforeUploadCb && extendParam?.beforeUploadCb(file);
  try {
    const {
      dir,
      host,
    } = aliOssPolicy;
    const client = await getOssClient(aliOssPolicy);
    const name = getFileName(file.name);
    console.log('multipartUploadOss', file);
    await client.multipartUpload(`${dir}/${name}`, file.blob, {
      progress: (p: number) => {
        extendParam?.progressCb && extendParam?.progressCb(p, file);
      },
      parallel: 4,
      partSize: 1024 * 1024, // 设置分片大小。默认值为1 MB，最小值为100 KB。
      meta: {
        year: 2021,
        people: 'test',
      },
      mime: file.blob.type,
    });
    const url = `${host}/${dir}/${name}`;
    triggerBackupUpload(data, file.blob, name, extendParam);
    extendParam?.completeUploadCb && extendParam?.completeUploadCb(url, file);
    return url;
  } catch (err) {
    throw '上传失败！请联系管理员或重新上传';
  }
};

/**
 * 分段上传 华为云
 * @param aliOssPolicy
 * @param file
 * @param fileName
 * @param progressCb
 * @returns
 */
const multipartUploadObs = async(
  hwObsPolicy: HuaWeiCloudInfoVo,
  file: UploadFileItem,
  data: UploadData,
  extendParam?: UploadExtendParam,
): Promise<string> => {
  extendParam?.beforeUploadCb && extendParam?.beforeUploadCb(file);
  try {
    const {
      host,
      dir,
      bucketName,
    } = hwObsPolicy;
    const obsClient = await getObsClient(hwObsPolicy);
    const name = getFileName(file.name);
    const sourceFile = file.blob || file;
    await obsClient.uploadFile({
      Bucket: bucketName,
      Key: `${dir}/${name}`,
      SourceFile: sourceFile,
      PartSize: 1024 * 1024,
      ProgressCallback(transferredAmount: number, totalAmount: number, totalSeconds: number) {
        const p = transferredAmount / totalAmount;
        extendParam?.progressCb && extendParam?.progressCb(p, file);
      },
    });
    const url = `${host}/${dir}/${name}`;
    triggerBackupUpload(data, sourceFile as Blob | File, name, extendParam);
    extendParam?.completeUploadCb && extendParam?.completeUploadCb(url, file);
    return url;
  } catch {
    throw '上传失败！请联系管理员或重新上传';
  }
};

/**
 * 单个文件下载
 * @param data
 * @param url
 * @param extendParam
 */
export const singleDownload = async(data: UploadData, url: string, extendParam?: UploadExtendParam) => {
  const policy = extendParam?.isAnon ? await getUploadTokenAnon(data) : data.obsConfigId === 3 ? await getUploadToken(data) : await getUploadTokenWithOutCheck(data);
  let path = '';
  try {
    path = new URL(url).pathname;
  } catch {
    path = url;
  }
  if (policy.activeType === 1) {
    downLoadObs(policy.huaWeiCloudInfoVo, path, extendParam);
  } else {
    downLoadOss(policy.aliCloudInfoVo, path, extendParam);
  }
};

/**
 * oss 下载
 * @param data
 * @param url
 * @param extendParam  文件名必须带着扩展名，不然会报错
 */
export const downLoadOss = async(aliCloudInfoVo: AliCloudInfoVo, path: string, extendParam?: UploadExtendParam) => {
  const client = await getOssClient(aliCloudInfoVo);
  const _name = path.split('/')[path.split('/').length - 1];
  const name = extendParam?.fileName || _name;
  const response = { 'content-disposition': `attachment; filename=${encodeURIComponent(decodeURI(name))}` };
  const downloadUrl = client.signatureUrl(decodeURI(path), { response });
  downLoad(downloadUrl);
};

/**
 * obs下载
 * @param data
 * @param url
 * @param extendParam
 */
export const downLoadObs = async(huaWeiCloudInfoVo: HuaWeiCloudInfoVo, path: string, extendParam?: UploadExtendParam) => {
  const { bucketName } = huaWeiCloudInfoVo;
  const obsClient = await getObsClient(huaWeiCloudInfoVo);
  const queryFolderName = path.replace(/\//, '');
  const _name = queryFolderName.split('/')[queryFolderName.split('/').length - 1];
  const name = extendParam?.fileName || _name;
  console.log('name', decodeURI(queryFolderName), name);
  const { SignedUrl } = obsClient.createSignedUrlSync({
    Method: 'GET',
    Bucket: bucketName,
    Key: decodeURI(queryFolderName),
    QueryParams: { 'response-content-disposition': `attachment; filename=${encodeURIComponent(decodeURI(name))}` },
  });
  console.log(SignedUrl);
  downLoad(SignedUrl);
};
const downLoad = (url: string) => {
  const downloadUrl = url;
  const downloadLink = document.createElement('a');
  downloadLink.style.display = 'none';
  downloadLink.download = '123';
  downloadLink.href = downloadUrl;
  downloadUrl ? downloadLink.click() : message.error('下载图片链接不存在');
};
