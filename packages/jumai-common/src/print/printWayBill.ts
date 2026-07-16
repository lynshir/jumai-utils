import { message, Modal } from 'antd';
import { request } from '../request';
import { getCustomPrintParam } from './customPrint';
import { printHelper } from './printHelper';
import type { BasePrintParams, TemplateData } from './types';
import { ENUM_PRINT_PLUGIN_TYPE, ENUM_WAY_BILL_TYPE } from './types';
import { formatRequestError, getRequestErrorStatus, readRemoteFile, sliceData, validateData } from './utils';

interface UserDataItem {
  remotePrintUrls?: string | string[];
  _remotePrintData?: string;
}

interface PrintData {
  cpCode?: string;
  type?: ENUM_WAY_BILL_TYPE;
  newPrint?: boolean;
  courierPrintType?: number;
  waybillData?: {
    tempData?: TemplateData;
    notHaveCourierNo?: string;
    havePrintList?: string;
    userData?: UserDataItem[];
    updateIds?: string;
    docIds?: string;
  };
}

/**
 * 重要参数preview、userDataIds、tempType、printSrc
 */
interface PrintWayBillParams {
  /**
   * 模版类型
   * '0': '快递单',
   * '1': '发货单',
   * '2': '捡货单',
   * '4': '商品信息',
   * '6': '水洗唛',
   * '7': '合格证',
   * '10': '分拣车',
   * '17': '出入库单',
   * '19': '调拨单',
   * '21': '收货单',
   * '27': '唯一码',
   */
  tempType?: string | number;

  /**
   * 是否预览
   */
  preview?: boolean;

  /**
   * 打印机
   */
  printer?: string;

  /**
   * 模版id
   */
  templateId?: number | string;

  /**
   * 待打印发货单ID
   */
  userDataIds?: string;

  /**
   * 打印来源
   *  PRINT_0(0, "未知来源打印"),
   *  PRINT_1(1, "前置打印"),
   *  PRINT_2(2, "分拣打印"),
   *  PRINT_3(3, "分拣补打"),
   *  PRINT_4(4, "收尾打印"),
   *  PRINT_5(5, "波次管理打印"),
   *  PRINT_6(6, "配齐墙单个打印"),
   *  PRINT_7(7, "配齐墙批量打印"),
   *  PRINT_8(8, "打包发货补打打印"),
   *  PRINT_9(9, "PDA分拣配齐后打印"),
   *  PRINT_10(10, "强制拆单打印"),
   *  PRINT_11(11, "分拣打印"),
   *  PRINT_12(12, "多包裹打印"),
   *  PRINT_13(13, "快速分拣打印"),
   *  PRINT_14(14, "快速分拣补打打印"),
   *  PRINT_15(15, "快速分拣配齐墙单个打印"),
   *  PRINT_16(16, "快速分拣配齐墙批量打印"),
   *  PRINT_17(17, "批量分拣打印"),
   *  PRINT_18(18, "确认退货打印"),
   *  PRINT_19(19, "分拣重打");
   */
  printSrc?: string | number;

  /**
   * 一次打印数量(默认500)
   */
  count?: number;

  /**
   * 排序策略
   */
  orderBy?: string;

  /**
   * 是否校验已打印状态(已打印、在波次内的不能打印)
   */
  checkPrint?: boolean;

  /**
   * 是否更新打印状态(暂时传false状态更新功能另作处理)
   */
  updateStatus?: boolean;

  /**
   * 是否未配齐墙(无用字段)
   */
  sortingWall?: boolean;

  /**
   * 是否清配齐格子(暂不支持传 false)
   */
  clearCell?: boolean;

  /**
   * 快递单号(多包裹获取的新单号)
   */
  courierNo?: string;

  /**
   * 更新回掉的参数
   */
  checkSku?: boolean;

  [key: string]: any;
}

class PrintWayBill {
  /**
   * 前置打印
   */
  public readonly frontPrint = async (params: PrintWayBillParams): Promise<void> => {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        content: params.preview ? '确定预览' : '确定打印',
        onOk: () => resolve(true),
        onCancel: () => reject(),
      });
    });

    await this.getDataAndPrint({
      printSrc: '1',
      checkPrint: true,
      ...params,
    });
  };

  /**
   * 自定义打印
   */
  public readonly customPrint = async (params: PrintWayBillParams): Promise<void> => {
    const customParams = await getCustomPrintParam('0');

    await this.getDataAndPrint({
      ...params,
      ...customParams,
    });
  };

  /**
   * 获取数据并且打印
   */
  public readonly getDataAndPrint = async (params: PrintWayBillParams): Promise<void> => {
    const newParams = {
      checkPrint: false,
      clearCell: false,
      sortingWall: false,
      orderBy: 'sku_no',
      ...params,
    };

    const printData = await request<{ data: PrintData[] }>({
      url: '/api/print/wms/waybill/queryWaybillPrintData',
      data: newParams,
      method: 'post',
    });

    validateData(printData.data);
    await this.executePrint(newParams, printData.data);
  };

  /**
   * 有数据,直接打印
   */
  public readonly executePrint = async (params: PrintWayBillParams, printData: PrintData[]): Promise<void> => {
    validateData(printData);
    console.log('本次打印数据',printData,new Date().toLocaleTimeString())
    for (let i = 0; i < printData.length; i++) {
      const waybillData = printData[i].waybillData;
      const tempData = waybillData.tempData;
      const userData = waybillData.userData;
      const waybillType = printData[i].type;
      const newPrint = printData[i].newPrint;
      const courierPrintType = printData[i].courierPrintType;
      const cpCode = printData[i].cpCode;

      const callbackData = {
        callbackIds: waybillData.updateIds,
        checkSku: params.checkSku,
        printSrc: params.printSrc,
        docIds: waybillData.docIds,
      };

      const commonPrintData: BasePrintParams = {
        printer: params.printer,
        preview: params.preview,
        count: params.count,
        contents: userData,
        templateData: tempData,
      };

      await handleWayBillRemotePrintUrl(userData);

      if (await this.handleNotify(waybillData)) {
        switch (waybillType) {
          case ENUM_WAY_BILL_TYPE.jd:
            await printHelper.print({
              ...commonPrintData,
              state: newPrint ? ENUM_PRINT_PLUGIN_TYPE.jdErp : ENUM_PRINT_PLUGIN_TYPE.jdCloud,
            });
            break;
          case ENUM_WAY_BILL_TYPE.pdd:
            await printHelper.print({
              ...commonPrintData,
              state: newPrint ? ENUM_PRINT_PLUGIN_TYPE.pddErp : ENUM_PRINT_PLUGIN_TYPE.pddCloud,
              courierPrintType,
            });
            break;
          case ENUM_WAY_BILL_TYPE.rookie:
            await printHelper.print({
              ...commonPrintData,
              state: newPrint ? ENUM_PRINT_PLUGIN_TYPE.rookieErp : ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld,
            });
            break;
          case ENUM_WAY_BILL_TYPE.dy:
            await printHelper.print({
              ...commonPrintData,
              state: newPrint ? ENUM_PRINT_PLUGIN_TYPE.dyErp : ENUM_PRINT_PLUGIN_TYPE.dyCloud,
            });
            break;
          case ENUM_WAY_BILL_TYPE.ks:
            await printHelper.print({
              ...commonPrintData,
              state: newPrint ? ENUM_PRINT_PLUGIN_TYPE.ksErp : ENUM_PRINT_PLUGIN_TYPE.ksCloud,
              cpCode,
            });
            break;
          case ENUM_WAY_BILL_TYPE.dw:
            await printHelper.print({
              ...commonPrintData,
              state: ENUM_PRINT_PLUGIN_TYPE.dw,
            });
            break;
          case ENUM_WAY_BILL_TYPE.xiaoHongShu:
            await printHelper.print({
              ...commonPrintData,
              state: newPrint ? ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuErp : ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuCloud,
            });
            break;
          case ENUM_WAY_BILL_TYPE.vopCloud:
            await printHelper.print({
              ...commonPrintData,
              state: ENUM_PRINT_PLUGIN_TYPE.vopCloud,
            });
            break;
          case ENUM_WAY_BILL_TYPE.vopErp:
            await printHelper.print({
              ...commonPrintData,
              state: ENUM_PRINT_PLUGIN_TYPE.vopErp,
            });
            break;
          case ENUM_WAY_BILL_TYPE.channelsShop:
            await printHelper.print({
              ...commonPrintData,
              state: ENUM_PRINT_PLUGIN_TYPE.channelsShop,
            });
            break;
          case ENUM_WAY_BILL_TYPE.aiCuKun:
            await printHelper.print({
              ...commonPrintData,
              state: ENUM_PRINT_PLUGIN_TYPE.aiKuCun,
            });
            break;

          // 有赞直接用菜鸟
          case ENUM_WAY_BILL_TYPE.youZan:
            await printHelper.print({
              ...commonPrintData,
              state: ENUM_PRINT_PLUGIN_TYPE.rookieErp,
            });
            break;
          default: {
            const error = `面单渠道类型:${waybillType}不存在`;
            message.error({
              key: error,
              content: error,
            });
            throw new Error(error);
          }
        }
        await this.updateStatus(callbackData);
      }
    }
  };

  private handleNotify = async (waybillData: PrintData['waybillData']): Promise<boolean> => {
    const notHaveCourierNo = waybillData.notHaveCourierNo;
    const havePrintList = waybillData.havePrintList;
    let step1 = true;
    let step2 = true;

    if (notHaveCourierNo) {
      step1 = await new Promise((resolve) => {
        Modal.confirm({
          title: '以下发货单没有获取到快递单号,打印时候将被跳过,确定继续打印',
          content: `${notHaveCourierNo}`,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    }

    if (havePrintList) {
      step2 = await new Promise((resolve) => {
        Modal.confirm({
          title: '以下单号已经打印过:「确定」继续打印,「取消」重新选择',
          content: `${havePrintList}`,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    }

    return step1 && step2;
  };

  private updateStatus = (data: { callbackIds: string | number; checkSku: boolean; printSrc: string | number; docIds: string }): Promise<any> => {
    return request({
      url: '/api/print/wms/waybill/updateWaybillPrintCallback',
      method: 'post',
      data,
    });
  };
}

/** 单次并发请求数，过高会导致浏览器报 ERR_INSUFFICIENT_RESOURCES */
const REMOTE_FETCH_CONCURRENCY = 20;
/** 同一 URL 最大重试次数 */
const REMOTE_FETCH_RETRY_COUNT = 3;
/** 重试基础间隔(ms)，按 300/600/1200 指数退避 */
const REMOTE_FETCH_RETRY_BASE_DELAY = 300;
/** 批次间间隔(ms)，减轻 CDN/OBS 突发压力 */
const REMOTE_FETCH_BATCH_DELAY = 100;

interface RemoteFetchAttempt {
  url: string;
  error: string;
  status?: number;
  durationMs: number;
  retryIndex: number;
}

class RemoteFetchError extends Error {
  readonly index: number;
  readonly attempts: RemoteFetchAttempt[];
  readonly urls: string[];

  constructor(index: number, attempts: RemoteFetchAttempt[], urls: string[]) {
    super(`第 ${index + 1} 条固定模板获取失败`);
    this.name = 'RemoteFetchError';
    this.index = index;
    this.attempts = attempts;
    this.urls = urls;
  }
}

function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

function formatRemoteFetchErrorDetail(error: RemoteFetchError): string {
  const attemptLines = error.attempts
    .map((attempt) => {
      const statusText = attempt.status ? ` HTTP ${attempt.status}` : '';
      const retryText = attempt.retryIndex > 0 ? ` 第${attempt.retryIndex + 1}次` : '';
      return `  - ${attempt.url}${retryText} → ${attempt.error}${statusText} (${attempt.durationMs}ms)`;
    })
    .join('\n');

  return `第 ${error.index + 1} 条（共尝试 ${error.urls.length} 个地址）:\n${attemptLines}`;
}

function buildRemoteFetchFailureMessage(failures: RemoteFetchError[], total: number): string {
  const preview = failures.slice(0, 5).map(formatRemoteFetchErrorDetail).join('\n\n');
  const more = failures.length > 5 ? `\n\n...还有 ${failures.length - 5} 条失败未展示` : '';

  return `获取固定模板数据失败：${failures.length}/${total} 条\n\n${preview}${more}`;
}

async function fetchRemoteData(item: UserDataItem, index: number): Promise<string> {
  const urlData = ([] as string[]).concat(item.remotePrintUrls || []).filter(Boolean);

  if (!urlData.length) {
    throw new RemoteFetchError(index, [{ url: '(空)', error: 'remotePrintUrls 为空', durationMs: 0, retryIndex: 0 }], []);
  }

  const attempts: RemoteFetchAttempt[] = [];

  // 数据存在多个 cdn 上，同一地址失败后会重试再切换下一个
  for (let i = 0; i < urlData.length; i++) {
    const url = urlData[i];

    for (let retryIndex = 0; retryIndex < REMOTE_FETCH_RETRY_COUNT; retryIndex++) {
      if (retryIndex > 0) {
        await sleep(REMOTE_FETCH_RETRY_BASE_DELAY * 2 ** (retryIndex - 1));
      }

      const start = Date.now();
      try {
        const text = await readRemoteFile(url);
        return text;
      } catch (e) {
        attempts.push({
          url,
          error: formatRequestError(e),
          status: getRequestErrorStatus(e),
          durationMs: Date.now() - start,
          retryIndex,
        });
        console.warn(`固定模板获取失败 index=${index + 1}, url=${url}, retry=${retryIndex + 1}`, e);
      }
    }
  }

  throw new RemoteFetchError(index, attempts, urlData);
}

function notifyRemoteFetchFailure(failures: RemoteFetchError[], total: number): void {
  const errorMessage = buildRemoteFetchFailureMessage(failures, total);

  console.error('获取固定模板数据失败', failures);
  message.error({
    key: 'remote-fetch-fail',
    content: `获取固定模板数据失败：${failures.length}/${total} 条，详见弹窗`,
    duration: 8,
  });
  Modal.error({
    title: '获取固定模板数据失败',
    content: errorMessage,
    width: 720,
  });
}

export async function handleWayBillRemotePrintUrl(userData: UserDataItem[]): Promise<UserDataItem[]> {
  if (!Array.isArray(userData)) {
    return [];
  }

  const filterNeedFetchData: Array<{ index: number; data: UserDataItem }> = [];
  userData.forEach((item, index) => {
    // url兼容字符串和数组
    if ((typeof item.remotePrintUrls === 'string' && item.remotePrintUrls.length) || (Array.isArray(item.remotePrintUrls) && item.remotePrintUrls.length)) {
      filterNeedFetchData.push({
        index,
        data: item,
      });
    }
  });

  if (!filterNeedFetchData.length) {
    return userData;
  }

  // 远端的地址需要支持 http2，且一次并发请求不能太多，太多浏览器会直接报错
  const pageFilterNeedFetchData = sliceData(filterNeedFetchData, REMOTE_FETCH_CONCURRENCY);
  const total = filterNeedFetchData.length;
  const failures: RemoteFetchError[] = [];

  console.log(`${new Date().toLocaleTimeString()},开始获取固定模板数据,共 ${total} 条,并发 ${REMOTE_FETCH_CONCURRENCY}`);

  for (let i = 0; i < pageFilterNeedFetchData.length; i++) {
    const batch = pageFilterNeedFetchData[i];
    const results = await Promise.allSettled(
      batch.map((item) =>
        fetchRemoteData(item.data, item.index).then((printData) => ({
          index: item.index,
          printData,
        })),
      ),
    );

    results.forEach((result, resultIndex) => {
      if (result.status === 'fulfilled') {
        userData[result.value.index]._remotePrintData = result.value.printData;
        return;
      }

      const reason = result.reason;
      if (reason instanceof RemoteFetchError) {
        failures.push(reason);
        return;
      }

      failures.push(
        new RemoteFetchError(batch[resultIndex].index, [
          {
            url: '(未知)',
            error: formatRequestError(reason),
            status: getRequestErrorStatus(reason),
            durationMs: 0,
            retryIndex: 0,
          },
        ], []),
      );
    });

    console.log(
      `${new Date().toLocaleTimeString()},固定模板批次 ${i + 1}/${pageFilterNeedFetchData.length} 完成,本批 ${batch.length} 条`,
    );

    if (i < pageFilterNeedFetchData.length - 1) {
      await sleep(REMOTE_FETCH_BATCH_DELAY);
    }
  }

  if (failures.length) {
    notifyRemoteFetchFailure(failures, total);
    throw new Error(buildRemoteFetchFailureMessage(failures, total));
  }

  console.log(`${new Date().toLocaleTimeString()},获取固定模板数据成功,共 ${total} 条`);

  return userData;
}

export const printWayBill = new PrintWayBill();
