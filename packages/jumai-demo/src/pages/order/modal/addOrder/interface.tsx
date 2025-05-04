export interface ShopInfo{
  properties: {
    default_courier_id: string;
    default_warehouse_id: string;
    platform_type: string;
    sender_comb_address: string;
    sender_name: string;
    sender_tel: string;
  };
}

export interface SkuInfo{
  id: number;
  colorType: string;
  sizeType: string;
  salePrice: string;
  skuId: number;
  pic: string;
  productName: string;
  spec: string;
}

export interface IProvince{
  province_id: string;
  province_name: string;
}

export interface IAdressResult{
  provinceId: string;
  cityId: string;
  districtId: string;
  province: string;
  city: string;
  district: string;
  phone: string;
  name: string;
  detail: string;
}

export interface IOrderInfo{
  shopId: number;
  totalSku: number;
  warehouseId: number;
  courierVo: {
    courierId: number;
  };
  platformType: number;
  buyerVo: {
    buyerNick: string;
    buyerMessage: string;
  };
  receiverVo: {
    receiverAddress: string;
    receiverName: string;
    receiverPhone: number;
    receiverMobile: number;
    receiverState: string;
    receiverCity: string;
    receiverDistrict: string;
  };
  senderVo: {
    senderAddress: string;
    senderMobile: string;
    senderName: string;
  };
  sellerMemo: string;
  saleOrderFinanceVo: {
    payment: string;
    totalFee: string;
    postFee: string;
    discountFee: string;
  };
  saleOrderDetailVoList: IEachProduct[];
  totalNum: number;
  payType: number;
}

interface IEachProduct{
  num: number;
  showSkuVo: {
    id: number;
    colorType: string;
    sizeType: string;
    productName: string;
    salePrice: string;
    spec: string;
    pic: string;
    productNo: string;
    skuNo: string;
  };
  saleOrderDetailFinanceVo: {
    price: string;
    payment: string;
  };
}
