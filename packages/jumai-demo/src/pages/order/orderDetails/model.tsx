import { message, Modal } from 'antd';
import { request } from 'jumai-utils';
import type { BaseData } from 'jumai-utils';
import { observable, action } from 'mobx';
import qs from 'qs';
import OperationTimeModel from '../../base/operationTime/model';
import SkuBreakUpModel from '../../base/skuBreakUp/model';
import CommodityInformation from './components/commodityInformation/model';
import DeliveryInformationModel from './components/deliveryInformation/model';
import OrderInformationModel from './components/orderInformation/model';
import ReceivingInformation from './components/receivingInformation/model';
import RemarkModel from './components/remark/model';
import type { ParentPropsInterface, Data, CommodityStatisticsInterface } from './interfaces/orderDetailsInterface';

export default class {
  constructor(props: ParentPropsInterface) {
    this.parent = props.parent;
  }

  @observable public checkedCode: number;

  @observable public parent;

  @observable public visible = false;

  @observable public spinning = false;

  @observable public receivingInformationData;// 收货信息

  public _init = () => {
    this.orderInformationModel = new OrderInformationModel(this);
    this.remarkModel = new RemarkModel(this);
    this.deliveryInformationModel = new DeliveryInformationModel(this);
    this.receivingInformation = new ReceivingInformation(this);
    this.operationTimeModel = new OperationTimeModel(this);
    this.commodityInformation = new CommodityInformation(this);
    this.skuBreakUpModel = new SkuBreakUpModel(this);
  };

  public orderInformationModel: OrderInformationModel;// 订单信息

  public remarkModel: RemarkModel;// 备注留言

  public deliveryInformationModel: DeliveryInformationModel;// 发货信息

  public receivingInformation: ReceivingInformation;// 收货信息

  public operationTimeModel: OperationTimeModel;// 操作日志

  public commodityInformation: CommodityInformation;// 商品信息

  public skuBreakUpModel: SkuBreakUpModel;// 自由拆分

  public buttonGroup = [
    {
      name: '审核',
      permissionId: '21',
      getDisabled: () => {
        return this.isChecked;
      },
      onClick: action(async() => {
        this.spinning = true;
        try {
          const req = await request<BaseData<{ successed?: number; list?: any[]; }>>({
            method: 'POST',
            url: '/api/saleorder/rest/order/checkOrder',
            data: { ids: [this.orderId]},
          });
          if (req.data.successed) {
            message.success('审核成功');
            await this.getSaleOrder(this.orderId);
            return;
          }
          message.error(`审核失败,${req.data?.list[0]?.reason}`);
        } catch (e) {
          console.error(e);
        } finally {
          this.spinning = false;
        }
      }),
    },
    {
      name: '反审核',
      onClick: () => {
        this.parent.handleButtonOperation('beforeUncheckOrders', this.orderId, async() => {
          await this.getSaleOrder(this.orderId);
        });
      },
      getDisabled: () => {
        return !this.isChecked;
      },
      permissionId: '29',
    },
    {
      name: '自由拆分',
      permissionId: '313',
      getDisabled: () => {
        return false;
      },
      onClick: () => {
        this.skuBreakUpModel.getTopGridRow(this.orderId);
      },
    },
    {
      name: '挂起',
      permissionId: '23',
      getDisabled: () => {
        return this.isSuspended;
      },
      onClick: () => {
        this.parent.suspendStore.showSuspendReasonModal();
      },
    },
    {
      name: '解挂',
      getDisabled: () => {
        return !this.isSuspended;
      },
      onClick: () => {
        this.parent.handleButtonOperation('unsuspendOrder', this.orderId, async() => {
          await this.getSaleOrder(this.orderId);
        });
      },
      permissionId: '23',
    },
    {
      name: '作废',
      permissionId: '25',

      getDisabled: () => {
        return false;
      },
      onClick: () => {
        this.parent.handleButtonOperation('invalidateOrders', this.orderId, async() => {
          this.spinning = true;
          try {
            await this.getSaleOrder(this.orderId);
          } catch (e) {
            console.error(e);
          } finally {
            this.spinning = false;
          }
        });
      },
    },
    // {
    //   name: '取消黑名单',
    //   permissionId: '217',
    //
    //   getDisabled: () => {
    //     return false;
    //   },
    //   onClick: async() => {
    //     const req = await request<BaseData<{ successed?: number; list?: any[]; }>>({
    //       method: 'POST',
    //       url: '/api/oms/rest/cancelBlacklist',
    //       data: { ids: this.orderId },
    //     });
    //     if (req.data.successed) {
    //       message.success('取消黑名单成功');
    //       return;
    //     }
    //     message.error(`取消黑名单失败,${req.data?.list[0]?.reason}`);
    //   },
    // },
    {
      name: '重新拿货',
      permissionId: '320',

      getDisabled: () => {
        return false;
      },
      onClick: action(async() => {
        this.spinning = true;
        try {
          const req = await request<BaseData<string>>({
            method: 'POST',
            url: '/api/oms/rest/batchOutOfStock',
            data: { ids: `${this.orderId}` },
          });
          await this.getSaleOrder(this.orderId);
          await this.commodityInformation.getCommodityData();
          message.success('重新拿货成功！');
        } catch (e) {
          console.error(e);
        } finally {
          this.spinning = false;
        }
      }),
    },
  ];

  public orderId: number;// 当前订单id

  public currentRow: any = {};

  @observable public stateTime: string[];

  @observable public isSuspended: boolean;

  @observable public isInvalidated: boolean;

  @observable public isChecked: boolean;

  public purchaseState: number;

  @observable public commodityStatistics: CommodityStatisticsInterface;

  @action
  public onOpenClick = async(orderId, currentRow) => {
    try {
      this.spinning = true;
      this._init();
      this.currentRow = currentRow;
      this.orderId = orderId;
      this.visible = true;

      await this.commodityInformation.getCommodityData();

      await this.operationTimeModel.getOrderLog();

      await this.getSaleOrder(orderId);
    } catch (e) {
      console.error(e);
    } finally {
      this.spinning = false;
    }
  };

  @action
  public onCancel = () => {
    this.visible = false;
    this.parent?.resetTable();
  };

  @action
  public getPostSaleOrder = async(saleOrderId) => {
    const req = await request<BaseData<Data>>({
      method: 'POST',
      url: '/api/oms/rest/header/v2/getSaleOrder',
      data: { saleOrderId },
    });
    this.getCommodityStatistics(req);
    return req;
  };

  @action
  public getCommodityStatistics = (req) => {
    const { totalNum, tradeMemo, totalSku, saleOrderFinanceVo: { payment, postFee, totalFee }} = req.data;
    this.commodityStatistics = {
      totalNum,
      totalSku,
      payment,
      postFee,
      totalFee,
    };
    if (this.isChecked !== undefined) {
      this.orderInformationModel.serFormValues({
        tags: {
          tradeMemo,
          tagList: this.getTagList(req.data),
        },
      });
    }
  };

  @action
  public getSaleOrder = async(saleOrderId) => {
    try {
      const req = await this.getPostSaleOrder(saleOrderId);
      const {
        created,
        payTime,
        checkedTime,
        omsCheckedTime,
        courierPrintTime,
        saleOrderNo,
        platformOrderCode,
        shopName,
        platformOrderStatus,
        originTypeDesc,
        payTypeDesc,
        isSuspended,
        isInvalidated,
        invalidTime,
        suspendNote,
        systemMemo,
        sellerMemo,
        orderTypeDesc,
        warehouseId,
        deadlineLogisticsTime,
        weight,
        purchaseStateDesc,
        cnServiceDesc,
        groupNo,
        tradeMemo,
        isChecked,
        sellerFlags,
        purchaseState,
        buyerVo: {
          buyerNick,
          buyerMessage,
        },
        courierVo: {
          courierId,
          courierOrderNo,
        },
        receiverVo: {
          receiverName,
          receiverPhone,
          receiverMobile,
          receiverAddress,
          receiverCity,
          receiverState,
          receiverDistrict,
          receiverTown,
        },
      } = req.data;
      this.stateTime = [
        created,
        payTime,
        omsCheckedTime,
        courierPrintTime,
        checkedTime,
      ];
      const orderInformationData = {
        saleOrderNo,
        platformOrderCode,
        shopName,
        buyerNick,
        platformOrderStatus,
        originTypeDesc,
        payTypeDesc,
        invalidTime,
        suspendNote,
        tags: {
          tradeMemo,
          tagList: this.getTagList(req.data),
        },
      };
      const remarkData = {
        buyerMessage,
        systemMemo,
        sellerMemo: {
          sellerFlag: Number(sellerFlags) ?? 0,
          remark: sellerMemo,
        },
      };
      const deliveryInformationModelData = {
        orderTypeDesc,
        warehouseId,
        courierId,
        courierOrderNo,
        weight,
        deadlineLogisticsTime,
        purchaseStateDesc,
        groupNo,
        cnServiceDesc,
      };
      const receivingInformationData = {
        receiverNameBlur: receiverName,
        receiverMobileBlur: receiverMobile || receiverPhone,
        receiverAddress: {
          receiverAddressBlur: receiverAddress,
          receiverCity,
          receiverState,
          receiverDistrict,
          receiverTown,
        },
      };
      this.receivingInformationData = receivingInformationData;
      this.isInvalidated = Boolean(isInvalidated);
      this.isSuspended = Boolean(isSuspended);
      this.isChecked = Boolean(isChecked);
      this.purchaseState = purchaseState;
      this.orderInformationModel.serFormValues(orderInformationData);
      this.remarkModel.serFormValues(remarkData);
      this.deliveryInformationModel.serFormValues(deliveryInformationModelData);
      this.receivingInformation.serFormValues(receivingInformationData);
    } catch (e) {
      console.error(e);
    }
  };

  public getTagList(params) {
    const _params = [];

    try {
      const {
        courierVo: { courierId },
        totalSku,
        totalNum,
        isSplit,
        isCombined,
        preSale,
        testOrder,
        orderType,
        originType,
        playState,
        isSuspended,
        isTestOrderDesc,
        isInvalidated,
        blacklistType,
        logisticsTimeOut,
        title,
        cnService,
        storeCode,
        proxySendStatus,
        priorityLockStock,
      } = params;
      if (!courierId) {
        _params.push({
          text: '递',
          color: '#2DC3BA',
        });
      }
      if (proxySendStatus && proxySendStatus !== 3) {
        _params.push({
          text: '代',
          color: '#27A358',
        });
      }

      if (totalSku < totalNum) {
        _params.push({
          text: '检',
          color: '#ff3300',
        });
      }
      if (isSplit) {
        _params.push({
          text: '拆',
          color: '#F7A651',
        });
      }
      if (isCombined) {
        _params.push({
          text: '合',
          color: '#97CD3F',
        });
      }
      if (priorityLockStock) {
        _params.push({
          text: '先',
          color: '#22DE38',
        });
      }
      if (orderType === 7) {
        _params.push({
          text: '缺',
          color: '#C5CAE4',
        });
      } else if (orderType === 4) {
        _params.push({
          text: '异',
          color: '#36B1EE',
        });
      }
      if (originType === 2) {
        _params.push({
          text: '售',
          color: '#806BDA',
        });
      }
      if (originType === 3) {
        _params.push({
          text: '外',
          color: '#2A6DD5',
        });
      }
      if (playState === 2) {
        _params.push({
          text: '财',
          color: '#82DC7E',
        });
      }
      if (isSuspended) {
        _params.push({
          text: '挂',
          color: '#A60000',
        });
      }
      if (isTestOrderDesc === '是') {
        _params.push({
          text: '测',
          color: '#DB55DB',
        });
      }
      if (isInvalidated) {
        _params.push({
          text: '废',
          color: '#FF7F00',
        });
      }
      if (preSale) {
        _params.push({
          text: '预',
          color: '#F67EB0',
        });
      }
      if (blacklistType === 1) {
        _params.push({
          text: '黑',
          color: '#575757',
        });
      }
      if (logisticsTimeOut) {
        _params.push({
          text: '超',
          color: '#D81E06',
        });
      }
      if (title) {
        _params.push({
          text: '票',
          color: 'red',
        });
      }
      if (cnService) {
        _params.push({
          text: '时',
          color: '#3399FF',
        });
      }
      if (storeCode) {
        _params.push({
          text: '京',
          color: '#74D96E',
        });
      }
      if (testOrder) {
        _params.push({
          text: '测',
          color: 'rgb(219, 85, 219)',
        });
      }

      return _params;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  public onRefreshGoods = () => {
    if (this.visible) {
      this.commodityInformation.getCommodityData();
      this.getPostSaleOrder(this.orderId);
    }
  };
}
