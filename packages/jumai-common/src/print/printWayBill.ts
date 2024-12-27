import { message, Modal } from 'antd';
import { request } from '../request';
import { getCustomPrintParam } from './customPrint';
import { printHelper } from './printHelper';
import type { BasePrintParams, TemplateData } from './types';
import { ENUM_PRINT_PLUGIN_TYPE, ENUM_WAY_BILL_TYPE } from './types';
import { readRemoteFile, sliceData, validateData } from './utils';

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
  public readonly frontPrint = async(params: PrintWayBillParams): Promise<void> => {
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
  public readonly customPrint = async(params: PrintWayBillParams): Promise<void> => {
    const customParams = await getCustomPrintParam('0');

    await this.getDataAndPrint({
      ...params,
      ...customParams,
    });
  };

  /**
   * 获取数据并且打印
   */
  public readonly getDataAndPrint = async(params: PrintWayBillParams): Promise<void> => {
    const newParams = {
      checkPrint: false,
      clearCell: false,
      sortingWall: false,
      orderBy: 'sku_no',
      ...params,
    };

    const printData = await request<{ data: PrintData[]; }>({
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
  public readonly executePrint = async(params: PrintWayBillParams, printData: PrintData[]): Promise<void> => {
    validateData(printData);

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

  private handleNotify = async(waybillData: PrintData['waybillData']): Promise<boolean> => {
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

  private updateStatus = (data: {
    callbackIds: string | number;
    checkSku: boolean;
    printSrc: string | number;
    docIds: string;
  }): Promise<any> => {
    return request({
      url: '/api/print/wms/waybill/updateWaybillPrintCallback',
      method: 'post',
      data,
    });
  };
}

async function fetchRemoteData(item: UserDataItem): Promise<string> {
  const urlData = [].concat(item.remotePrintUrls);

  // 数据存在多个cdn上
  for (let i = 0; i < urlData.length; i++) {
    try {
      const text = await readRemoteFile(urlData[i]);
      return text;
    } catch (e) {
      console.log(e);
    }
  }

  throw new Error('获取远端数据失败');
}

export async function handleWayBillRemotePrintUrl(userData: UserDataItem[]): Promise<UserDataItem[]> {
  if (!Array.isArray(userData)) {
    return [];
  }

  const filterNeedFetchData: Array<{ index: number; data: UserDataItem; }> = [];
  userData.forEach((item, index) => {
    // url兼容字符串和数组
    if ((typeof item.remotePrintUrls === 'string' && item.remotePrintUrls.length) || (Array.isArray(item.remotePrintUrls) && item.remotePrintUrls.length)) {
      filterNeedFetchData.push({
        index,
        data: item,
      });
    }
  });

  // 此处远端的地址需要支持http2,且一次并发请求不能太多,太多浏览器会直接报错
  const pageFilterNeedFetchData = sliceData(filterNeedFetchData, 500);

  for (let i = 0; i < pageFilterNeedFetchData.length; i++) {
    const promises: Array<Promise<{ index: number; printData: string; }>> = pageFilterNeedFetchData[i].map((item) => fetchRemoteData(item.data)
      .then((printData) => ({
        index: item.index,
        printData,
      }))
      .catch((info) => {
        const error = '获取固定模板数据失败';
        console.error(info);
        message.error({
          key: error,
          content: error,
        });
        return Promise.reject(info);
      })
    );

    const data = await Promise.all(promises);
    console.log('获取固定模板数据成功');

    data.forEach((item) => {
      userData[item.index]._remotePrintData = item.printData;
    });
  }

  return userData;
}

export const printWayBill = new PrintWayBill();
