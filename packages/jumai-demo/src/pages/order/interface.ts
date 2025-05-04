import type { EgGridModel } from 'jumai-utils';

export interface MainTableList{
  id: string;
}

export interface Warehouse{
  warehouse_id: number;
  warehouse_name: string;
}

export interface IWarehouse{
  warehouseId: number;
  warehouseName: string;
}

export interface Courier{
  courier_id: number;
  courier_name: string;
}

export interface IShop{
  shopId: number | string;
  shopName: string;
}

export interface IOperationRes{
  failed: number;
  successed: number;
  total: number;
  operationName: string;
  list: failedSuspendOrder[];
}

interface failedSuspendOrder {
  reason: string;
  saleOrderNo: string;
}

export interface ProductPaginationData<T = unknown>{
  list: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPageCount: number;
}

export interface csRes{
  platformOrderCode: string;
  platformOrderStatus: string;
}
export interface WholesaleInterface {
  goodsPrice: number;
  returnServicePriceRate: number;
  skuVoList: Array<{
    color: string;
    goodsId: number;
    goodsSkuId: number;
    num: number;
    goodsSkuNo: string;
    picUrl: string;
    price: number;
    returnRate: number;
    returnable: number;
    size: string;
    totalPrice: number;
  }>;
  supportReturnNum: number;
  totalNum: number;
  wholesaleServicePrice: number;
}

export interface OrderList{
  carelessTradeOrderId: number;
  tradeOrderId: number;
}

export interface Wholesale {
  supportReturnNum: number;
  totalNum: number;
  returnServicePriceRate: number;
  goodsPrice: number;
  wmsSkuInfoVoList: WmsSkuInfoVoList[];
}

export interface WmsSkuInfoVoList {
  skuVoList: SkuVoList[];
  cloudWmsId: number;
  cloudWmsName: string;
  courierFeeTos: CourierFeeTo[];
  egGridModel?: EgGridModel;
}

export interface CourierFeeTo {
  courierId: number;
  cpCode: string;
  courierName: string;
  postFee: number;
}

export interface SkuVoList {
  goodsSkuId: number;
  goodsId: number;
  picUrl: string;
  goodsSkuNo: string;
  color: string;
  size: string;
  price: number;
  num: number;
  totalPrice: number;
  returnable: number;
  returnRate?: any;
}

export interface Platform {
  id: number;
  platformType: number;
  platformName: string;
  iconUrl: string;
}

export interface OperatorListItem {
  userName: string;
  operatorId: number;
}

