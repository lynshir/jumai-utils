export enum ENUM_WAY_BILL_TYPE {
  rookie = 0,
  pdd = 1,
  jd = 2,
  dy = 3,
  ks = 4,
  dw = 5,
  xiaoHongShu = 6,
  vopCloud = 7,
  vopErp = 9,
  channelsShop = 8,
  aiCuKun = 10,
  youZan = 11
}

export enum ENUM_PRINT_PLUGIN_TYPE {
  rookieCustomOld,
  rookieErp,
  rookieCustom,
  pddCloud,
  pddErp,
  dyCloud,
  dyErp,
  jdCloud,
  jdErp,
  ksCloud,
  ksErp,
  lodop,
  dw,
  xiaoHongShuCloud,
  xiaoHongShuErp,
  vopCloud,
  vopErp,
  channelsShop,
  aiKuCun,
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
  id?: number | string;
  defalt?: number;
  templateType?: any;
  colsCount?: string;
  ddlfontsize?: number;
  category_no?: string;
  pageHeight?: string;
  bkimgHeight?: string;
  pageWidth?: string;
  inRow?: string;
  empName?: string;
  cainiaoTempXml?: string;
  rowCount?: string;
  backgrd?: string;
  moren_fontfamliy?: string;
  courierNo?: any;
  tempType?: string;
  productType?: any;
  inCols?: string;
  textAlign?: string;
  printerName?: string;
  mysqlno?: string;
  updateTime?: string;
  mysqlid?: string | number;
  cainiaoTemp?: string;

  /**
   * 1---纵(正)向打印，固定纸张
   * 2---横向打印，固定纸张
   * 3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；
   */
  intOrient?: 1 | 2 | 3;
  itemList?: LodopItem[];
  itemDetailList?: {[key: string]: LodopItem; };
  strPageName?: string;
  content?: TemplateData;
  tempUrl?: string;
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
  state?: ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld
  | ENUM_PRINT_PLUGIN_TYPE.rookieErp
  | ENUM_PRINT_PLUGIN_TYPE.rookieCustom
  | ENUM_PRINT_PLUGIN_TYPE.jdCloud
  | ENUM_PRINT_PLUGIN_TYPE.jdErp
  | ENUM_PRINT_PLUGIN_TYPE.dyCloud
  | ENUM_PRINT_PLUGIN_TYPE.dyErp
  | ENUM_PRINT_PLUGIN_TYPE.lodop
  | ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuErp
  | ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuCloud
  | ENUM_PRINT_PLUGIN_TYPE.vopCloud
  | ENUM_PRINT_PLUGIN_TYPE.vopErp
  | ENUM_PRINT_PLUGIN_TYPE.channelsShop
  | ENUM_PRINT_PLUGIN_TYPE.aiKuCun
  | ENUM_PRINT_PLUGIN_TYPE.dw;
}

export interface KsPrintParams extends BasePrintParams {
  state: ENUM_PRINT_PLUGIN_TYPE.ksCloud | ENUM_PRINT_PLUGIN_TYPE.ksErp;
  cpCode?: string;
}

export interface PddPrintParams extends BasePrintParams {
  state: ENUM_PRINT_PLUGIN_TYPE.pddCloud | ENUM_PRINT_PLUGIN_TYPE.pddErp;

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
