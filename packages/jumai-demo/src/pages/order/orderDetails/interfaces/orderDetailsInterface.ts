import type { Store } from '../../store';
import type model from '../model';

export interface ParentPropsInterface {
  store?: model;
  parent?: Store;
}

export interface Data {
  afterSaleNote?: string;
  shopName?: string;
  courierPrintTime?: string;
  afterSaleType?: number;
  afterSaleTypeDesc?: string;
  agentDeliverVo?: AgentDeliverVo;
  approveState?: number;
  archiveState?: number;
  areaId?: number;
  blacklistReason?: string;
  blacklistType?: number;
  blacklistTypeDesc?: string;
  buyerMessageRead?: boolean;
  buyerVo?: BuyerVo;
  cellNo?: string;
  checkedTime?: string;
  cnService?: string;
  cnServiceDesc?: string;
  codStatus?: number;
  commonBaseVo?: CommonBaseVo;
  courierVo?: CourierVo;
  created?: string;
  customerId?: number;
  deadlineLogisticsTime?: string;
  deleteDetail?: boolean;
  delivered?: boolean;
  detailPicList?: string[];
  distributionState?: number;
  distributionStateDesc?: string;
  endTime?: string;
  estConTime?: string;
  groupNo?: string;
  haveNotes?: boolean;
  informationSensitive?: boolean;
  invalidTime?: string;
  invoiceContent?: string;
  invoiceName?: string;
  invoiceOrderNo?: string;
  invoiceType?: number;
  invoiceTypeDesc?: string;
  isAfterSale?: number;
  isAfterSaleClosed?: number;
  isAmountChanged?: number;
  isApproved?: number;
  isChecked?: number;
  isClosed?: number;
  isCombined?: number;
  isInvalidated?: number;
  isOutOfStock?: number;
  isPaid?: number;
  isPartChanged?: number;
  isPartConsign?: number;
  isSplit?: number;
  isSuspended?: number;
  isTestOrderDesc?: string;
  isToBeShipped?: number;
  lackStockNoticeState?: boolean;
  logisticsErrorResponse?: string;
  logisticsErrorTime?: string;
  logisticsTimeOut?: boolean;
  modified?: string;
  obs?: number;
  omsCheckedTime?: string;
  omsProcessType?: number;
  orderType?: number;
  orderTypeDesc?: string;
  originType?: number;
  originTypeDesc?: string;
  originWarehouseId?: number;
  originalOrderId?: number;
  outWarehouseTime?: string;
  pauseState?: number;
  payTime?: string;
  payType?: number;
  payTypeDesc?: string;
  platformLogistics?: boolean;
  platformLogisticsTime?: string;
  platformOrderCode?: string;
  platformOrderCode2?: number;
  platformOrderStatus?: string;
  platformType?: number;
  platformTypeDesc?: string;
  playState?: number;
  playStateDesc?: string;
  preSale?: boolean;
  priorityLockStock?: boolean;
  purchaseOrderId?: number;
  purchaseOrderNo?: string;
  purchaseState?: number;
  purchaseStateDesc?: string;
  receiverChanged?: boolean;
  receiverVo?: ReceiverVo;
  retryNum?: number;
  saleOrderDetailVoList?: SaleOrderDetailVoList[];
  saleOrderFinanceVo?: SaleOrderFinanceVo;
  saleOrderId?: number;
  saleOrderNo?: string;
  sellerFlag?: number;
  sellerFlags?: string;
  sellerMemo?: string;
  sellerMemoRead?: boolean;
  sellerRate?: number;
  sendCourierOrderNo?: boolean;
  senderVo?: SenderVo;
  shippingType?: number;
  shopId?: number;
  snapshotUrl?: string;
  status?: number;
  stepTradeStatus?: number;
  stopState?: number;
  storeCode?: string;
  suspendNote?: string;
  sysPromotionInfo?: string;
  systemLogistics?: boolean;
  systemMemo?: string;
  testOrder?: boolean;
  threePlTiming?: boolean;
  tmallDelivery?: boolean;
  totalNum?: number;
  totalSku?: number;
  tradeFrom?: number;
  tradeFromDesc?: string;
  tradeMemo?: string;
  tradeSource?: number;
  type?: number;
  unapproveNote?: string;
  warehouseId?: number;
  weight?: string;
  weightUnitId?: number;
  weightValue?: number;
  whIsToBeShipped?: boolean;
  wmsOrderState?: number;
  wmsOrderStateDesc?: string;
  zeroPurchase?: number;
}

export interface AgentDeliverVo {
  agentDeliver?: boolean;
  agentFee?: number;
  agentPaid?: boolean;
  agentPayTime?: string;
  agentPostFee?: number;
  agentTotalPrice?: number;
}

export interface BuyerVo {
  buyerNick?: string;
  buyerArea?: any;
  buyerMessage?: string;
}

export interface CommonBaseVo {
  createdAt?: string;
  creator?: number;
  lastUpdated?: string;
  lastUpdater?: number;
  tenantId?: number;
  usable?: boolean;
}

export interface CourierVo {
  courierId?: number;
  courierOrderNo?: string;
  courierPrintMarkState?: number;
  courierPrintMarkStateDesc?: string;
  courierPrintTime?: string;
}

export interface ReceiverVo {
  receiverAddress?: string;
  receiverAddressBlur?: string;
  receiverCity?: string;
  receiverCountry?: string;
  receiverDistrict?: string;
  receiverMobile?: string;
  receiverMobileBlur?: string;
  receiverName?: string;
  receiverNameBlur?: string;
  receiverPhone?: string;
  receiverPhoneBlur?: string;
  receiverState?: string;
  receiverTown?: string;
  receiverZip?: string;
}

export interface SaleOrderFinanceVo {
  discountFee?: string;
  hasPostFee?: number;
  hasYfx?: number;
  payment?: string;
  postFee?: string;
  totalFee?: string;
  yfxType?: number;
}

export interface SenderVo {
  senderAddress?: string;
  senderMobile?: string;
  senderName?: string;
  senderPhone?: string;
}

export interface SaleOrderDetailVoList {
  arrivalNum?: number;
  buyerVo?: BuyerVo;
  commonBaseVo?: CommonBaseVo;
  costPrice?: number;
  costPriceDesc?: string;
  distributionPrice?: number;
  distributionPriceDesc?: string;
  distributionState?: string;
  endTime?: string;
  goodsSkuId?: number;
  invalid?: boolean;
  isAdvancedBooking?: number;
  isDonate?: number;
  isOutOfStock?: number;
  isServiceOrder?: number;
  isWww?: number;
  itemMealId?: number;
  itemMealName?: string;
  modified?: string;
  num?: number;
  numIid?: string;
  oid?: string;
  orderFrom?: number;
  originEstimateConTime?: string;
  originPlatformOrderCode?: string;
  originSaleOrderId?: number;
  picPath?: string;
  platformSkuId?: string;
  promotionPlanId?: number;
  purchaseNextDate?: string;
  purchaseOrderId?: number;
  purchaseOrderNo?: string;
  refundId?: number;
  refundStatus?: string;
  refundType?: number;
  reissueNumber?: number;
  returnedNumber?: number;
  saleOrderDetailFinanceVo?: SaleOrderDetailFinanceVo;
  saleOrderDetailId?: number;
  saleOrderId?: number;
  saleOrderNo?: string;
  sellerOuterNo?: string;
  sellerRate?: number;
  showSkuVo?: ShowSkuVo;
  skuCostPrice?: string;
  skuId?: number;
  skuPropertiesName?: string;
  skuPurchaseState?: number;
  skuPurchaseStateDesc?: string;
  snapshotUrl?: string;
  status?: string;
  suitResource?: string;
  terminate?: boolean;
  title?: string;
  tmserSpuCode?: number;
  type?: number;
  uniqueCode?: string;
  virtualStockLockNum?: number;
  warehouseId?: number;
}

export interface SaleOrderDetailFinanceVo {
  payment?: string;
  postFee?: string;
  price?: string;
  totalFee?: number;
}

export interface ShowSkuVo {
  barCode?: string;
  colorType?: string;
  colorTypeCode?: number;
  costPrice?: string;
  costPriceUpdateTime?: string;
  distributionPrice?: string;
  donation?: boolean;
  enabled?: boolean;
  id?: number;
  pic?: string;
  productId?: number;
  productName?: string;
  productNo?: string;
  salePrice?: string;
  sellerOuterNo?: string;
  shortDesc?: string;
  sizeType?: string;
  sizeTypeCode?: number;
  skuNo?: string;
  skuType?: number;
  spec?: string;
  tenantId?: boolean;
  usable?: boolean;
  vendorId?: number;
  vendorName?: string;
}
export interface CommodityStatisticsInterface {
  totalNum?: number;
  totalSku?: number;
  payment?: string;
  postFee?: string;
  totalFee?: string;
}
