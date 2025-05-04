import type { EgGridModel } from 'jumai-utils';

export interface OrderList {
  carelessTradeOrderId: number;
  tradeOrderId: number;
}

export interface Wholesale {
  supportReturnNum: number;
  totalNum: number;
  returnServicePriceRate: number;
  valueAddVos: EachAddVoProps[];
  goodsPrice: number;
  wmsSkuInfoVoList: WmsSkuInfoVoList[];
  vendorSkuInfoVoList: WmsSkuInfoVoList[];
}

export interface EachAddVoProps {
  serviceName: string;
  num: number;
  amount: number;
  valueAddWarehouseInfos: EachContentProps[];
}

export interface EachContentProps {
  cloudWarehouseName: string;
  price: number;
  num: number;
}

export interface WmsSkuInfoVoList {
  platformFinanceServiceAmount: number;
  platformFinanceServiceAmountRate: number;
  defaultCourier: number;
  skuVoList: SkuVoList[];
  cloudWmsId: number;
  cloudWmsName: string;
  shopId: number;
  shopName: string;
  courierFeeTos: CourierFeeTo[];
  egGridModel?: EgGridModel;
  perBillingProjectCosts: PerBillingProjectCostsVO[];
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
  limitPriceTips: boolean;
  limitSalePriceTips: boolean;
}

export interface QuickSaleInfo {
  goodsExceptionInfos: string[];
  wholeSaleQuickAmountVo: {
    orderNum: number;
    platformServiceAmount: number;
    skuNum: number;
    totalAmount: number;
    valueAddServiceAmount: number;
    wholeSaleServiceAmount: number;
  };
  wholeSaleQuickCacheId: string;
}

// 极速代发生成批次号
export interface QuickCreateMallOrder {
  callBackUrl: string;
  orderNum: number;
  outBatchNo: string;
}

export interface PerBillingProjectCostsVO {
  productName: string;
  amount: number;
}
