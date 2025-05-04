export enum ENUM_WAY_BILL_TYPE {
  rookie = 0,
  pdd = 1,
  jd = 2,
  dy = 3,
  ks = 4,
  dw = 5,
  xiaoHongShu = 6,
  vop = 7,
  channelsShop = 8
}

export enum ENUM_PRINT_PLUGIN_TYPE {
  rookieOld,
  rookieNew,
  rookieCustom,
  pddOld,
  pddNew,
  dyOld,
  dyNew,
  jdOld,
  jdNew,
  ksOld,
  ksNew,
  lodop,
  dw,
  xiaoHongShuNew,
  xiaoHongShuOld,
  vop,
  channelsShop
}

export enum ENUM_LODOP_ITEM_TYPE {
  customText = '0',
  noTitleText = '1',
  hasTitleText = '2',
  tableInlineText = '3',
  printTime = 'printTime',
  qrCode = 'erweima',
  detailQrCode = 'erweima-detail',
  barCode = 'tiaoxingma',
  detailBarCode = 'tiaoxingma-detail',
  img = 'customImge',
  horizontalLine = 'hengxian',
  verticalLine = 'shuxian',
  rect = 'juxing',
  skuDetail = 'skudetail'
}

export interface TemplateData {
  _id?: number | string;
  channelTemp: string;
  content: string;
  createTime: string;
  creator: number;
  defaultStatus: boolean;
  lastUpdateTime: string;
  lastUpdater: number;
  printFooter: number;
  printHeader: number;
  printHeight: number;
  printTemplateId: number;
  printWidth: number;
  printerName: string;
  remark: string;
  splitPage: number;
  tempName: string;
  tempType: number;
  tempUrl: string;
  vendorTemplate: string;
}

export interface LodopItem {
  orderValue?: string;
  txt?: string;
  fontFamily?: string;
  top?: number;
  left?: number;
  width?: number;
  weight?: number;
  fontSize?: number;
  id?: string;
  txttype?: ENUM_LODOP_ITEM_TYPE;
  alignment?: string;
  height?: number;
  hideText?: string;
}

/**
 * 基本打印参数
 */
export interface BasePrintParams {

  /**
   * 一次打印数据页数(默认500)
   */
  count?: number;

  /**
   * 模版数据
   */
  templateData?: TemplateData;

  /**
   * 是否预览
   */
  preview: boolean;

  /**
   * 打印机
   */
  printer?: string;

  /**
   * 打印数据
   */
  contents?: any[];

  /**
   * 预览类型,默认pdf
   */
  previewType?: 'pdf' | 'image';
}

/**
 * 公共参数
 */
export interface CommonPrintParams extends BasePrintParams {
  state?: ENUM_PRINT_PLUGIN_TYPE.rookieOld
  | ENUM_PRINT_PLUGIN_TYPE.rookieNew
  | ENUM_PRINT_PLUGIN_TYPE.rookieCustom
  | ENUM_PRINT_PLUGIN_TYPE.jdOld
  | ENUM_PRINT_PLUGIN_TYPE.jdNew
  | ENUM_PRINT_PLUGIN_TYPE.dyOld
  | ENUM_PRINT_PLUGIN_TYPE.dyNew
  | ENUM_PRINT_PLUGIN_TYPE.lodop
  | ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuNew
  | ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuOld
  | ENUM_PRINT_PLUGIN_TYPE.vop
  | ENUM_PRINT_PLUGIN_TYPE.channelsShop
  | ENUM_PRINT_PLUGIN_TYPE.dw;
}

export interface KsPrintParams extends BasePrintParams {
  state: ENUM_PRINT_PLUGIN_TYPE.ksOld | ENUM_PRINT_PLUGIN_TYPE.ksNew;
  cpCode?: string;
}

export interface PddPrintParams extends BasePrintParams {
  state: ENUM_PRINT_PLUGIN_TYPE.pddOld | ENUM_PRINT_PLUGIN_TYPE.pddNew;

  /**
   * 快递类型---基本废弃,相关代码保留
   */
  courierPrintType?: number;
}

export interface PrintAbstract {
  getPrinters: () => Promise<string[]>;
  print: (...arg: any[]) => Promise<any>;
}

export interface CustomPageData {
  data: { split_sku_list: string; };
  templateUrl: string;
}
