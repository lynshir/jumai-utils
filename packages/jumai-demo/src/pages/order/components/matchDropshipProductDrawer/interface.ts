export interface OrderProduct {
  sale_order_id: number;
  pic_url?: string; // 商品图片
  title: string; // 商品名称
  seller_outer_no: string; // 商家编码 sku
  sku_properties_name: string; // 规格
  sku_id: string; // 商品id
  platform_sku_id: string; // 平台skuid
  originType: number;
}

export interface IFormValues {
  vendorId: number;
  goodsName: string; // 款式名称
  goodsNo: string; // 款式货号
}

export interface Vendor {
  id: number;
  vendorName: string;
  shopNo: string;
  shopName: string;
}

export interface VendorProduct {
  costPriceStr: string; // 拿货价
  mainPicUrl: string; // 图片
  goodsName: string; // 商品名称
  goodsNo: string; // 衫海经款式货号
  vendorShopName: string; // 档口名称
  vendorShopId: number;
  goodsId: number;
}

// 供应商商品各个颜色尺码详情
export interface VendorProductDetail {
  color: string;
  skuList: Array<{
    color: string;
    goodsSkuNo: string;
    posGoodsSkuId: number;
    size: string;
  }>;
}
