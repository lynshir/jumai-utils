import _ from 'lodash';
import { message, Modal } from 'antd';
import axios from 'axios';
import { getStaticResourceUrl } from 'jumai-base';
import type { BasePrintParams, CustomPageData, TemplateData } from './types';
import { ENUM_PRINT_PLUGIN_TYPE } from './types';

export function isSocketConnected(socket: WebSocket, openError: string): boolean {
  if (null == socket) {
    message.error({
      content: openError,
      key: openError,
    });
    return false;
  }

  if (socket.readyState === WebSocket.OPEN) {
    return true;
  } else {
    const error = '打印机正在连接';
    message.warn({
      key: error,
      content: error,
    });
    return false;
  }
}

export function getUUID(len?: number, radix?: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = [];
  if (len) {
    for (let i = 0; i < len; i++) {
      uuid[i] = chars[0 | (Math.random() * (radix || chars.length))];
    }
  } else {
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (let i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return `${uuid.join('')}_${Date.now()}`;
}

export function getTemplateData(tempData: TemplateData): Omit<TemplateData, 'content'> {
  if (tempData?.content && tempData.content && Object.keys(tempData.content).length > 0) {
    const { content, ...rest } = tempData;

    const newContent = {};
    for (const contentKey in content) {
      if (Object.prototype.hasOwnProperty.call(content, contentKey) && content[contentKey] != null && content[contentKey] !== '') {
        newContent[contentKey] = content[contentKey];
      }
    }

    return {
      ...rest,
      ...newContent,
    };
  } else {
    return tempData;
  }
}

export function formatPrintName(tempData: TemplateData, printerName?: string) {
  if (printerName) {
    return printerName;
  } else {
    return getTemplateData(tempData)?.printerName;
  }
}

export function sliceData<T = any>(data: T[], count = 500): T[][] {
  if (!(Array.isArray(data) && data.length)) {
    return [];
  }

  const result: T[][] = [];
  data.forEach((item, index) => {
    const currentPage = (index / count) >>> 0;
    if (result[currentPage]) {
      result[currentPage].push(item);
    } else {
      result[currentPage] = [item];
    }
  });
  return result;
}

export function get(data: any, path: string[]): any {
  let value = data;
  for (let i = 0; i < path.length; i++) {
    if ((typeof value === 'object' && value !== null) || Array.isArray(value)) {
      value = value[path[i]];
    }
  }

  return value;
}

// skuList-vendor_id-hz4692ym6 取前2个
export function lodopItemGetText(data: any, id: string): any {
  const path: string[] = [];
  const [key1, key2] = id.split('-');

  const key1Path: string[] = typeof key1 === 'string' ? key1.split('.') : [];
  for (let i = 0; i < key1Path.length; i++) {
    path.push(key1Path[i]);
  }

  const key2Path: string[] = typeof key2 === 'string' ? key2.split('.') : [];
  for (let i = 0; i < key2Path.length; i++) {
    path.push(key2Path[i]);
  }

  return get(data, path.filter(Boolean));
}

/**
 * 格式化条码数据
 * @param row 一页的行
 * @param col 一页的列
 * @param data 打印数据
 */
export function formatBarcodeData(row: number, col: number, data: any[]): any[] {
  if (!(Array.isArray(data) && data.length)) {
    return [];
  }

  const height = row >>> 0;
  const width = col >>> 0;

  // 一页打多个条码
  if (height >= 1 && width >= 1 && (height > 1 || width > 1)) {
    const pageSize = width * height;
    const totalPage = Math.ceil(data.length / pageSize);
    const result = Array(totalPage).fill(null);

    data.forEach((item, index) => {
      const currentPage = (index / pageSize) >>> 0;
      const pagePosition = index % pageSize;
      const h = (pagePosition / width) >>> 0;
      const w = pagePosition % width;
      const itemKey = `item_${h}_${w}`;
      if (result[currentPage]) {
        result[currentPage][itemKey] = item;
      } else {
        result[currentPage] = { [itemKey]: item };
      }
    });

    return result;
  } else {
    return data;
  }
}

function getCustomPageData(item: any): CustomPageData | null {
  if (item?.wmsOrder?.split_sku_list && item?.wmsOrder?.sku_template) {
    return {
      data: item.wmsOrder || {},
      templateUrl: item.wmsOrder.sku_template,
    };
  }

  return null;
}

export function formatRookieData(printData: any[], type: ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld | ENUM_PRINT_PLUGIN_TYPE.rookieErp, printTemplate?: TemplateData): any[] {
  const documents: any[] = [];

  (printData || []).forEach((item) => {
    // 固定数据
    if (item._remotePrintData) {
      documents.push(JSON.parse(item._remotePrintData));
    } else if (item.newCaiNiao) {
      documents.push(JSON.parse(item.newCaiNiao));
    }

    // 自定义数据
    if (type === ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld) {
      if (getTemplateData(printTemplate)?.id) {
        documents.push({
          data: item,
          templateURL: item.templateURL ? item.templateURL : `${window.location.origin}/api/print/getCainiaoTempXml/${getTemplateData(printTemplate)?.id}`,
        });
      }
    } else if (type === ENUM_PRINT_PLUGIN_TYPE.rookieErp) {
      if (getCustomTemplateUrlNew(item)) {
        documents.push({
          data: getCustomDataNew(item),
          templateURL: getCustomTemplateUrlNew(item),
        });
      }
    }

    if (getCustomPageData(item)) {
      documents.push({
        data: getCustomPageData(item).data,
        templateURL: getCustomPageData(item).templateUrl,
      });
    }
  });

  if (documents.length) {
    return [
      {
        documentID: getUUID(),
        contents: documents,
      },
    ];
  } else {
    return [];
  }
}

export function formatRookieCustomData(printData: any[], printTemplate?: TemplateData): any[] {
  const documents: any[] = [];
  printTemplate = getTemplateData(printTemplate);

  (printData || []).forEach((item) => {
    // 自定义数据
    if (printTemplate?.tempUrl) {
      documents.push({
        data: item,
        templateURL: printTemplate.tempUrl,
      });
    }
  });

  if (documents.length) {
    return [
      {
        documentID: getUUID(),
        contents: documents,
      },
    ];
  } else {
    return [];
  }
}

export function formatXiaoHongShuData(printData: any[], type: ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuErp | ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuCloud): any[] {
  const contents = [];
  (printData || []).forEach((item) => {
    const documents: any[] = [];
    // 固定数据
    if (item._remotePrintData) {
      documents.push(JSON.parse(item._remotePrintData));
    } else if (item.newCaiNiao) {
      documents.push(JSON.parse(item.newCaiNiao));
    }

    // 自定义数据
    if (type === ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuCloud) {
      if (item.pinduoduo) {
        documents.push({
          data: JSON.parse(item.pinduoduo),
          templateURL: getCustomTemplateUrlNew(item),
        });
      }
    } else if (type === ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuErp) {
      if (getCustomTemplateUrlNew(item)) {
        documents.push({
          data: getCustomDataNew(item),
          templateURL: getCustomTemplateUrlNew(item),
        });
      }
    }
    // 如果后端有分页数据，需要拼接数据
    if (getCustomPageData(item)) {
      documents.push({
        data: getCustomPageData(item).data,
        templateURL: getCustomPageData(item).templateUrl,
      });
    }
    contents.push({
      documentID: getUUID(),
      contents: documents,
    });
  });
  console.log(contents, type, '小红书组装后的数据');
  if (contents.length) {
    return contents;
  } else {
    return [];
  }
}

export function formatVopData(printData: any[], type: ENUM_PRINT_PLUGIN_TYPE.vopCloud | ENUM_PRINT_PLUGIN_TYPE.vopErp): any[] {
  const documents: any[] = [];

  (printData || []).forEach((item) => {
    if (type === ENUM_PRINT_PLUGIN_TYPE.vopCloud) {
      const customData = item._remotePrintData || item.newCaiNiao;

      if (getCustomTemplateUrlNew(item) && customData) {
        documents.push({
          data: JSON.parse(customData),
          templateURL: getCustomTemplateUrlNew(item),
        });
      }
    } else if (type === ENUM_PRINT_PLUGIN_TYPE.vopErp) {
      const customData = item._remotePrintData || item?.printMetaData?.printData;
      const customTemplateUrl = item?.printMetaData?.tempUrl;

      if (customTemplateUrl && customData) {
        documents.push({
          data: JSON.parse(customData),
          templateURL: customTemplateUrl,
        });
      }
    }
  });

  if (documents.length) {
    return [
      {
        documentID: getUUID(),
        contents: documents,
      },
    ];
  } else {
    return [];
  }
}

export function formatKsData(printData: any[], type: ENUM_PRINT_PLUGIN_TYPE.ksCloud | ENUM_PRINT_PLUGIN_TYPE.ksErp, cpCode?: string): any[] {
  const documents: any[] = [];

  (printData || []).forEach((item) => {
    const contents = [];

    // 固定数据
    if (item._remotePrintData) {
      contents.push(JSON.parse(item._remotePrintData));
    } else if (item?.ksData?.printData) {
      contents.push(JSON.parse(item?.ksData?.printData));
    }

    // 自定义数据
    if (type === ENUM_PRINT_PLUGIN_TYPE.ksCloud && item?.ksData?.customData) {
      contents.push({
        customData: JSON.parse(item?.ksData?.customData),
        templateURL: getKslTemplateUrlOld(item?.ksData?.customTempUrl, cpCode),
      });
    } else if (type === ENUM_PRINT_PLUGIN_TYPE.ksErp && getCustomTemplateUrlNew(item)) {
      contents.push({
        customData: getCustomDataNew(item),
        templateURL: getCustomTemplateUrlNew(item),
      });
    }

    if (contents.length) {
      documents.push({
        documentID: getUUID(),
        contents,
        ksOrderFlag: true,
      });
    }
  });

  return documents;
}

export function formatDyData(printData: any[], type: ENUM_PRINT_PLUGIN_TYPE.dyCloud | ENUM_PRINT_PLUGIN_TYPE.dyErp): any[] {
  const documents: any[] = [];

  (printData || []).forEach((item) => {
    const contents = [];

    // 固定数据
    if (item._remotePrintData) {
      // dy的固定模板签名有时间限制,不能和cdn数据一起存储,签名数据后端返回后再拼接
      const fixedTemplateData = JSON.parse(item._remotePrintData);
      if (item?.dyData?.params) {
        fixedTemplateData.params = item?.dyData?.params;
      }
      contents.push(fixedTemplateData);
    } else if (item?.dyData?.printData) {
      contents.push(JSON.parse(item?.dyData?.printData));
    }

    // 自定义数据
    if (type === ENUM_PRINT_PLUGIN_TYPE.dyCloud && item?.dyData?.customData) {
      contents.push({
        data: JSON.parse(item?.dyData?.customData),
        templateURL: item?.dyData?.customTempUrl || process.env.REACT_APP_DY_CUSTOM_TEMPLATE_URL || getStaticResourceUrl('customer-source/printTemp/dy2.xml'),
      });
    } else if (type === ENUM_PRINT_PLUGIN_TYPE.dyErp && getCustomTemplateUrlNew(item)) {
      contents.push({
        data: getCustomDataNew(item),
        templateURL: getCustomTemplateUrlNew(item),
      });
    }

    if (contents.length) {
      documents.push({
        documentID: getUUID(),
        contents,
      });
    }

    if (getCustomPageData(item)) {
      documents.push({
        documentID: getUUID(),
        contents: [
          {
            data: getCustomPageData(item).data,
            templateURL: getCustomPageData(item).templateUrl,
          },
        ],
      });
    }
  });

  return documents;
}

export function formatPddData(printData: any[], type: ENUM_PRINT_PLUGIN_TYPE.pddCloud | ENUM_PRINT_PLUGIN_TYPE.pddErp, courierPrintType?: number): any[] {
  const documents: any[] = [];

  (printData || []).forEach((item) => {
    const contents = [];

    // 固定数据
    if (item._remotePrintData) {
      contents.push(JSON.parse(item._remotePrintData));
    } else if (item.newCaiNiao) {
      contents.push(JSON.parse(item.newCaiNiao));
    }

    // 自定义数据
    if (type === ENUM_PRINT_PLUGIN_TYPE.pddCloud && item.pinduoduo) {
      contents.push({
        data: JSON.parse(item.pinduoduo),
        templateURL: courierPrintType
          ? process.env.REACT_APP_PDD_TEMPLATE_URL_1 || getStaticResourceUrl('customer-source/printTemp/pdd_waybill_yilian_template.xml')
          : process.env.REACT_APP_PDD_TEMPLATE_URL_0 || getStaticResourceUrl('customer-source/printTemp/pdd_waybill_seller_area_template.xml'),
      });
    } else if (type === ENUM_PRINT_PLUGIN_TYPE.pddErp && getCustomTemplateUrlNew(item)) {
      contents.push({
        data: getCustomDataNew(item),
        templateURL: getCustomTemplateUrlNew(item),
      });
    }

    if (contents.length) {
      documents.push({
        documentID: getUUID(),
        contents,
      });
    }

    if (getCustomPageData(item)) {
      documents.push({
        documentID: getUUID(),
        contents: [
          {
            data: getCustomPageData(item).data,
            templateURL: getCustomPageData(item).templateUrl,
          },
        ],
      });
    }
  });

  return documents;
}

export function formatChannelsShopData(printData: any[]): any[] {
  const documents: any[] = [];
  (printData || []).forEach((item) => {
    if (getCustomTemplateUrlNew(item) && getCustomDataNew(item)) {
      documents.push({
        taskID: getUUID(),
        printInfo: item._remotePrintData || item?.printMetaData?.printData,
        printNum: {
          curNum: 1,
          sumNum: 1,
        },
        customInfo: {
          templateUrl: getCustomTemplateUrlNew(item),
          data: getCustomDataNew(item),
        },
      });
    }
  });

  return documents;
}

export function formatJdData(
  printData: any[],
  type: ENUM_PRINT_PLUGIN_TYPE.jdCloud | ENUM_PRINT_PLUGIN_TYPE.jdErp,
  preview: BasePrintParams['preview'],
  printer: BasePrintParams['printer'],
): any[] {
  const documents: any[] = [];
  printData.forEach((item) => {
    const { jdqlData, _remotePrintData } = item;
    if (jdqlData) {
      documents.push({
        preview,
        printer,
        printData: [_remotePrintData || jdqlData.printData],
        tempUrl: jdqlData.tempUrl,
        customData: jdqlData.customData ? [JSON.parse(jdqlData.customData)] : jdqlData.customData,
        customTempUrl: type === ENUM_PRINT_PLUGIN_TYPE.jdCloud ? getJdCustomTemplateUrlOld(jdqlData.customTempUrl) : getCustomTemplateUrlNew(item),
      });
    }
  });

  return documents;
}

export async function formatDwData(printData: any[]): Promise<any[]> {
  const documents: any[] = [];
  printData ||= [];

  for (let i = 0; i < printData.length; i++) {
    const item = printData[i];
    let fixTemplateData = item._remotePrintData || item?.dwData?.printData;
    const customTemplateUrl = item?.customTempUrl;

    if (fixTemplateData) {
      // 兼容原来的数组格式数据
      fixTemplateData = [].concat(JSON.parse(fixTemplateData));
      for (let j = 0; j < fixTemplateData.length; j++) {
        const printData = fixTemplateData[j];

        // 自定义模板的目前只是单纯渲染文字及数据
        // 没有引入过多模板引擎,直接使用lodash.template简单处理
        let customContent: string;
        if (customTemplateUrl) {
          const customTemplate = await readRemoteFile(customTemplateUrl);
          customContent = _.template(customTemplate)({ _data: item });
        }

        documents.push({
          printData,
          customContent,
        });
      }
    }
  }

  return documents;
}

export function getKslTemplateUrlOld(customUrl?: string, cpCode?: string): string {
  if (customUrl) {
    return customUrl;
  }

  if (cpCode === 'SF') {
    return process.env.REACT_APP_KS_SF_CUSTOM_TEMPLATE_URL || getStaticResourceUrl('customer-source/printTemp/ks_sf_custom_template.xml');
  } else {
    return process.env.REACT_APP_KS_OTHER_CUSTOM_TEMPLATE_URL || getStaticResourceUrl('customer-source/printTemp/ks_other_custom_template.xml');
  }
}

export function getJdCustomTemplateUrlOld(customUrl?: string): string {
  const defaultUrl = 'https://storage.360buyimg.com/jdl-template/custom-1d208dda-02c0-4a31-a3ae-6d88b2f256f3.1624851609527.txt';
  return customUrl || process.env.REACT_APP_JD_CUSTOM_TEMPLATE_URL || defaultUrl;
}

export function getCustomTemplateUrlNew(listItem: any): string {
  const result = listItem?.customTempUrl;
  if (!result) {
    console.error('打印面单的自定义模板url不存在,请先配置');
  }
  return result;
}

export function getCustomDataNew(listItem: any): any {
  if (!listItem) {
    console.error('打印面单自定义数据不存在,请检查接口');
  }
  return listItem;
}

// @ts-ignore
export function validateData(data?: any[]) {
  const error = '没数据,请检验数据是否为空';
  if (!(Array.isArray(data) && data.length > 0)) {
    message.error({
      key: error,
      content: error,
    });
    console.error(data);
    throw new Error(error);
  }
}

export function loadScripts(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('script');
    element.src = src;
    element.onload = function () {
      resolve();
    };
    element.onerror = function (e) {
      reject(e);
    };
    document.head.appendChild(element);
  });
}

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsText(blob, 'utf-8');
    fileReader.onload = (event) => {
      resolve(event.target.result as string);
    };
    fileReader.onerror = function () {
      reject();
    };
  });
}

export async function readRemoteFile(url: string): Promise<string> {
  // 不用组件库的request(有版本号请求头,不是简单请求,涉及跨域处理,麻烦)
  console.log('打印模板获取开始url', url);
  const info = await axios.request<Blob>({
    url,
    withCredentials: false,

    // 设置超时时间
    timeout: 1000 * 15,
    timeoutErrorMessage: '请求超时',

    // 直接返回text有中文乱码问题,利用blob和fileReader读取
    responseType: 'blob',
  });

  return readBlobAsText(info.data);
}

export const handleSocketDisconnectNotification = (function () {
  let isFirst = false;
  return function () {
    const error = '打印连接已经断开,要进行打印业务请检查打印机、网络等。然后刷新页面';
    message.error({
      key: error,
      content: error,
      duration: 10,
    });

    if (!isFirst) {
      isFirst = true;
      Modal.confirm({
        content: error,
        okText: '知道了',
      });
    }
  };
})();
