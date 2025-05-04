export const api = {
  // 字典
  commonDict: '/api/baseinfo/rest/dict/findDictsMapByType/',

  // 售后单处理
  queryMainTable: '/api/oms/rest/af/querys', // 主表
  querySubTable: '/api/oms/rest/detail/af/queryByAfterId', // 子表
  getAfterSaleLogsById: '/api/saleorder/rest/log/queryAfterLogsById', // 日志
  changeRefundCourierName: '/api/oms/rest/changeRefundCourierName', // 更新退货快递公司
  changeRefundCourierNo: '/api/oms/rest/changeRefundCourierNo', // 更新退货快递单号
  updateAfterSaleOrderReceiver: '/api/oms/rest/updateAfterSaleOrderReceiver/whiteList', // 收货人信息
  verificationAfterSale: '/api/oms/rest/verificationAfterSale', // 补发
  processStatusFinish: '/api/oms/rest/processStatusFinish', // 标记完成
  omsConfigSave: '/api/oms/rest/af/config/process/save', // 参数设置
  configWarehouseList: '/warehouse/list', // 参数设置-仓库
  queryOmsConfig: '/api/oms/rest/af/config/process/query', // 参数设置-数据
  queryBatchSkuPrintData: '/api/productSkuPrint/queryBatchSkuPrintData', // 打印条码数据
  queryPrintTagDataList: '/aftersale/queryPrintTagDataList', // 打印合格证
  orderDelete: '/api/oms/rest/delete', // 售后单作废

  // 绑定订单
  queryBindingOrder: '/api/oms/rest/af/header/query', // 查询绑定订单列表
  queryBindingOrderDetail: '/api/oms/rest/vdetail/getOrderDetail', // 查询绑定订单明细
  getWareHouseList: '/api/baseinfo/rest/warehouse/getAllBaseInfo', // 获取仓库列表
  gerCourierList: '/api/baseinfo/rest/courier/enabledList/V0', // 获取快递公司列表
  getProvinceList: '/api/baseinfo/rest/province/getAll', // 获取省份列表
  getCityList: '/api/baseinfo/rest/city/queryByProvinceId', // 获取城市列表
  getDistrictList: '/api/baseinfo/rest/district/queryByCityId', // 获取区域列表
  parseAddress: '/api/infrastructure/address/parse', // 地址反解析
  bindingOrder: '/api/oms/rest/binding', // 绑定售后单
  querySkuList: '/api/oms/rest/sku/query', // 查询sku列表
  queryColorAndSize: '/api/baseinfo/rest/sku/findAllColorAndSize', // 根据sku查询颜色尺码
  bindingSaleOrder: '/api/oms/rest/bindingSaleOrder', // 绑定订单

  // 订单查询
  queryHistoryList: '/api/oms/rest/history/header/query', // 查询订单主表
  querySuspendType: '/api/baseinfo/rest/dict/findDictsMapByType/suspend_type', // 查询挂起原因
  suspendOrder: '/api/oms/rest/suspend', // 挂起订单
  unsuspendOrder: '/api/oms/rest/unsuspend', // 解挂订单
  uncloseOrder: '/api/oms/rest/unCloseOrder', // 继续发货
  invalidateOrders: '/api/oms/rest/invalidateOrders', // 作废订单
  uninvalidateOrders: '/api/oms/rest/uninvalidateOrders', // 反作废
  matchSku: '/api/oms/rest/match/sku', // 匹配无效订单
  queryRemarkInfo: '/api/oms/rest/af/config/order/query', // 查询备注信息
  save: '/api/oms/rest/af/config/order/save', // 保存备注内容
  uploadRemark: '/api/saleorder/rest/memo/uploadSellerMemo', // 上传备注
  addNote: '/api/oms/rest/notes/newNote', // 新增标签
  queryNote: '/api/oms/rest/notes/getAllNotes', // 查询标签
  dealNote: '/api/oms/order_notes/notes', // 查询/新增订单标签（废弃）
  getShopList: '/api/baseinfo/rest/shop/query/list', // 获取店铺字典
  queryOrderInfo: '/api/oms/rest/vdetail/getOrderDetail', // 查询订单详情（商品详情）

  // 订单处理
  querySaleOrderList: '/api/oms/rest/header/v2/saleOrderList', // 订单处理迁移后接口
  queryHistoryOrderList: '/api/oms/rest/history/header/v2/saleOrderList', // 订单查询主表接口
  queryOrderList: '/api/oms/rest/header/query', // 订单处理主表(废弃)
  querySaleOrder: '/api/oms/rest/header/v2/getSaleOrder', // 获取单个订单（订单详情）
  queryHistorySaleOrder: '/api/oms/rest/history/header/v2/getSaleOrder', // 获取历史订单详情
  updateCourierId: '/api/oms/rest/updateSaleOrderCourierId', // 更新快递
  updateWarehouseId: '/api/oms/rest/updateSaleOrderWarehouseId', // 更新仓库
  querySkuV2: '/api/oms/rest/sku/v2/skuList', // 查询sku
  addProduct: '/api/oms/rest/addDetail', // 保存添加商品
  combine: '/api/saleorder/rest/combine/combine', // 合并
  deleteProduct: '/api/oms/rest/deleteSaleOrderDetail', // 删除商品
  terminateProduct: '/api/oms/rest/terminateSaleOrderDetail', // 终结商品
  unterminateProduct: '/api/oms/rest/unterminateSaleOrderDetail', // 反终结商品
  copyProduct: '/api/oms/rest/copyDetail', // 复制商品
  matchProduct: '/api/oms/rest/detail/match', // 匹配sku
  changeProduct: '/api/oms/rest/changeBySkuId', // 换商品
  changeProdcutCount: '/api/oms/rest/detail/count', // 改变商品数量
  querySizeOrColor: '/api/baseinfo/rest/sku/getSkuSizeOrColor', // 查询颜色尺码
  changeColorSize: '/api/oms/rest/changeByColorAndSize', // 改变颜色尺码
  getGroup: '/api/oms/rest/group', // 获取分组数据
  checkMergeGroup: '/api/oms/rest/checkMergeGroup', // 检查合并分组
  mergeGroup: '/api/oms/rest/mergeGroup', // 合并分组
  getAllLabels: '/api/oms/rest/label/getAllLabels', // 获取所有标签
  getAllLabelsV2: '/api/oms/rest/label/getAllLabelsV2', // 获取所有标签（设置标签）
  createNewLabel: '/api/oms/rest/label/newLabel', // 新增标签
  deleteLabel: '/api/oms/rest/label/delLabel', // 删除标签
  updateLabel: '/api/oms/rest/label/updateLabel', // 更新标签
  updateOrderLabels: '/api/oms/rest/label/updateOrderLabels', // 更新订单标签
  queryDict: '/api/baseinfo/rest/dict/findDictsMapByType/', // 查字典
  queryShopInfo: '/api/baseinfo/rest/shop/query/single/full/info', // 查询店铺信息
  createNewOrder: '/api/oms/rest/vsaleorder/createSaleOrder', // 创建新订单
  beforeUncheckOrders: '/api/saleorder/rest/status/beforeUncheck', // 确认反审核
  uncheckOrders: '/api/saleorder/rest/status/uncheckOrders', // 反审核
  cancelBlackList: '/api/oms/rest/cancelBlacklist', // 取消黑名单
  confirmBlackList: '/api/oms/rest/confirmBlacklist', // 设置黑名单
  updateWarehouseAndCourier: '/api/oms/rest/updateWareHouseAndCourier', // 更新仓库和快递
  updateNote: '/api/saleorder/rest/notes/insert', // 更新标签
  getOriginShopList: ' /api/baseinfo/rest/shop/auth/list', // 店铺权限列表
  getOriginWarehouseList: '/api/baseinfo/rest/warehouse/auth/list', // 仓库权限列表
  reRunBatch: '/api/oms/rest/reRunBatch', // 重算订单
  generatePurchaseOrder: '/api/oms/rest/header/generatePurchaseOrder', // 生成采购订单
  batchOutOfStock: '/api/oms/rest/batchOutOfStock', // 批量重新拿货
  detailSplit: '/api/oms/rest/split/detailSplit', // 分录拆分
  skuSplit: '/api/oms/rest/split/skuSplit', // sku拆分
  percentageSplit: '/api/oms/rest/split/stockPercentageSplit', // 按比例拆分
  setPercentage: '/api/oms/rest/config/set/percentage', // 设置比例
  getPercentage: '/api/oms/rest/config/get', // 获取比例
  queryOriginReceiverInfo: '/api/oms/rest/receiver/queryOriginReceiverInfoBySaleOrderId', // 获取收货人解密信息
  getPlaintextData: '/api/oms/rest/receiver/queryOriginReceiverInfoBySaleOrderId', // 获取收货人原始信息
  updateReceiverInfo: '/api/oms/rest/receiver/update', // 更新收货信息
  splitCombineQuery: '/api/saleorder/rest/splitCombine/query', // 拆分/合并订单还原
  splitReturn: '/api/saleorder/rest/split/splitReturn', // 拆分还原
  combineReturn: '/api/saleorder/rest/combine/combineReturn', // 合并还原
  platformPreShipmentType: '/api/oms/rest/platform/logistic/header/type', // 获取预发货类型
  savePreShipmentInfo: '/api/oms/rest/platform/logistic/header/execute', // 保存预发货

  // 订单处理：代发
  querySkuInfo: '/api/mall/rest/wholesale/querySkuInfo', // 代发订单ERP获取选款sku信息
  createMallOrder: '/api/mall/rest/wholesale/wholesaleOrdersCreateMallOrder', // 代发单生成选款单

  // 代发(极速)
  queryQuicklyData: '/api/mall/rest/wholesale/queryQuicklyWholeSaleSimpleData', // 查询订单大致信息
  createQuicklyOrder: '/api/mall/rest/wholesale/quickWholeSale', // 极速代发确认支付

  // 增值服务
  queryAllShops: '/api/baseinfo/rest/shop/query/list', // 查询所有店铺
  getShopConfig: '/api/cloud/baseinfo/rest/value/added/external/proxy/shop/config/',
  queryMaterial: '/api/cloud/baseinfo/rest/value/added/material/external/bind/query',
  setService: '/api/cloud/baseinfo/rest/value/added/external/proxy/shop/config/edit', // 设置增值服务
  queryQualifyCert: '/api/print/queryCertTemplateList', // 获取合格证
};
