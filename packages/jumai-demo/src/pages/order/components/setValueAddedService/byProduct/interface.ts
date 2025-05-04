import type { Material } from '../interface';

export interface Product {
  gmsGoodsId: number;
  mainPicUrl: string;
  shopId: number;
  shopName: string;
  goodsName: string;
  platformId: number;
  addedService: number; // 增值服务 1换吊牌 3换包装 4合格证 5放好评卡 6放发货单 8水洗唛 9换领标
  lastUpdateTime: number;
}

export interface Service {
  enable: boolean;
  valueAddedName: string;
  valueAddedType: number;
  material?: Material;
  wmsProxyValueAddedDetailId?: string;
}
