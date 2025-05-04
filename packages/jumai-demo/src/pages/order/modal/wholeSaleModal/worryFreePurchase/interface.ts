export interface GoodsVos {
  picUrl: string;
  goodsName: string;
  vendorId: number;
  goodsId: number;
  worryFreeNum: number;
  goodsNum: number;
  returnable: number;
  returnRate: number;
  returnPeriod: number;
  protectRate: number;
  price: number;
  skuDiscountPrice: number;
  skuActivityPrice: number;
  worryFreeCost: string | number;
  [propsName: string]: any;
}

export type SkuVos = GoodsVos;
