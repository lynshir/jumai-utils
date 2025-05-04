import { message, Modal } from 'antd';
import { add } from 'jumai-common';
import type { BaseData } from 'jumai-utils';
import { EgGridModel, request } from 'jumai-utils';
import { action, computed, observable } from 'mobx';
import { api } from '../../../../utils';
import { nanoid } from 'nanoid';
import { egGridModelConfig, tipContent } from './constant';
import type { OrderList, Wholesale, WmsSkuInfoVoList } from './interface';
import SetValueAddedService from '../../components/setValueAddedService/store';
import { QuickSaleStore } from './quickSale';
import type { GoodsVos } from './worryFreePurchase/interface';
import { WorryFreePurchaseStore } from './worryFreePurchase/store';

export default class WholeSaleStore {
  constructor() {
    const params = location.href.split('?')[1];
    const search = new URLSearchParams(params);

    const pageType = search.get('pageType');
    this.fromPageType = pageType;

    // 取消注册过的回调
    if (window.top.egenie) {
      window.top.egenie.beforeCloseDict = { wholeSalePage: null };
    }

    // 普通代发
    if (search.get('ids')) {
      const ids = search.get('ids')?.split(',')
        .map((item) => Number(item));
      const tenantIds = search.get('tenantIds')?.split(',')
        .map((item) => Number(item));
      this.onShow(ids, tenantIds);
    } else {
      // 极速代发
      this.isQuickSale = true;

      const queryParams = search.get('vo');
      this.quickSaleStore.initData(pageType, queryParams);

      // 注册关闭页面回调(极速代发支付中添加)
      if (window.top.egenie) {
        window.top.egenie.beforeCloseDict = { wholeSalePage: this.handleQuickClose };
      }
    }
  }

  public fromPageType = '1';// 默认订单处理带过来

  public isQuickSale = false;

  public quickSaleStore = new QuickSaleStore({ parent: this });

  public setValueAddedServiceStore = new SetValueAddedService({
    onCloseCallback: () => {
      this.queryList();
    },
  });

  @observable public showQuickCloseModal = false;

  @observable public loadingVisible = false;

  @observable public ids = []; // 代发订单ids

  public tenantIds = [];// 订单租户ids

  @observable public spinning = false;

  @observable public wmsSkuInfoVoList: WmsSkuInfoVoList[] = []; // 按云仓拆分后的商品列表

  @observable private feeParams = []; // 已选择的运费信息

  @observable private shopFeeParams = []; // 已选择的档口运费信息

  @observable private selectedGoodsList = []; // 已选择的无忧退货

  @observable public courierFeePrice = 0; // 总运费

  @observable public returnServicePrice = 0; // 无忧退货服务费

  @observable public showActivationGuide = false;

  @observable public valueAddVos = [];// 增值服务列表

  @observable public closeFlag = false;// 是否关闭本单增值服务

  @observable public wholesaleParams = {
    safeReturnNum: 0, // 无忧退货件数
    supportReturnNum: 0, // 支持无忧退货的商品数量
    returnServicePriceRate: 0, // 无忧退货服务费率
    totalNum: 0, // 代发总数
    goodsPrice: 0, // 商品金额
  };

  // 计算增值服务费
  @computed public get valueAddFee(): number {
    return Array.isArray(this.valueAddVos) && this.valueAddVos.length > 0 ? this.valueAddVos.reduce((accu, cur) => {
      return add(accu, cur.amount);
    }, 0) : 0;
  }

  public handleQuickClose = () => {
    if (this.loadingVisible) {
      this.toggleQuickCloseModal(true);
    } else {
      // 先取消回调 防止重复调用
      if (window.top.egenie) {
        window.top.egenie.beforeCloseDict = { wholeSalePage: null };
      }
      window.top.egenie.closeTab('wholeSalePage');
    }
  };

  @action public toggleQuickCloseModal = (flag: boolean) => {
    this.showQuickCloseModal = flag;
  };

  // 打开/关闭增值服务弹窗
  @action public toggleActivationGuide = (flag: boolean) => {
    this.showActivationGuide = flag;
  };

  @action public onShow = (ids?: number[], tenantIds?: number[]) => {
    this.ids = ids;
    this.tenantIds = tenantIds;
    this.queryList();
  };

  // 打开/关闭本单增值服务
  @action public toggleValueAddVos = (closeFlag: boolean) => {
    this.closeFlag = closeFlag;
  };

  @action public queryList = async(): Promise<void> => {
    this.spinning = true;

    const saleOrderParams = this.ids.map((item, index) => {
      return {
        saleOrderId: item,
        saleOrderTenantId: this.tenantIds[index],
      };
    });
    try {
      const res: BaseData<Wholesale> = await request({
        url: api.querySkuInfo,
        method: 'POST',
        data: { saleOrderParams },
      });
      const { returnServicePriceRate, totalNum, wmsSkuInfoVoList, vendorSkuInfoVoList, supportReturnNum, goodsPrice, valueAddVos } = res.data;
      (wmsSkuInfoVoList || []).concat(vendorSkuInfoVoList || []).forEach((el) => {
        el.egGridModel = new EgGridModel(egGridModelConfig);

        // 增加了达人价之后skuId可能会有重复
        el.egGridModel.rows = Array.isArray(el.skuVoList) ? el.skuVoList.map((item) => ({
          ...item,
          gridKey: nanoid(5),
        })) : [];

        // 快递自动选择最低的
        const postFeeList = el.courierFeeTos.map((item) => item.postFee);
        const lowestPostFee = Math.min(...postFeeList);
        const courierFee = el.courierFeeTos.find((item) => item.postFee === lowestPostFee);
        if (courierFee) {
          el.defaultCourier = courierFee.courierId;

          // 构造option满足onSelectPostFee方法
          const option = {
            key: courierFee.cpCode,
            children: [
              0,
              0,
              courierFee.postFee,
              0,
            ],
          };
          this.onSelectPostFee(courierFee.courierId, option, el.cloudWmsId || el.shopId, `${el.cloudWmsId ? 'cloud' : 'vendor'}`);
        }
      });
      this.valueAddVos = valueAddVos;
      this.wmsSkuInfoVoList = wmsSkuInfoVoList.concat(vendorSkuInfoVoList || []);
      this.wholesaleParams = {
        ...this.wholesaleParams,
        supportReturnNum,
        returnServicePriceRate,
        goodsPrice,
        totalNum,
      };
    } finally {
      this.spinning = false;
    }
  };

  // 购买退货无忧
  @action public onBuySafeReturnClick = () => {
    const worryFreeGoodsList = [];
    this.wmsSkuInfoVoList.forEach((el) => {
      const skuVoList = el.skuVoList.filter((v) => v.returnable === 2); // 支持无忧退货
      skuVoList.forEach((sku) => {
        const index = worryFreeGoodsList.findIndex((item) => item.goodsId === sku.goodsId);
        if (index > -1) {
          worryFreeGoodsList[index].worryFreeNum += sku.num;
        } else {
          worryFreeGoodsList.push({
            ...sku,
            worryFreeNum: sku.num,
            returnable: sku.returnable,
            returnRate: sku.returnRate,
            goodsNum: 1,
            protectRate: this.wholesaleParams.returnServicePriceRate,
          });
        }
      });
    });
    this.worryFreePurchaseStore.onShow(worryFreeGoodsList, this.selectedGoodsList);
  };

  @action public onSelectPostFee = (value, options, cloudWmsOrShopId: number, type: string) => {
    if (type === 'cloud') {
      const index = this.feeParams.findIndex((item) => item.cloudWmsId === cloudWmsOrShopId);
      if (index > -1) {
        this.feeParams[index].courierId = value;
        this.feeParams[index].cpCode = options?.key;
        this.feeParams[index].postFee = options?.children && options.children[2] ? options.children[2] : 0;
      } else {
        this.feeParams.push({
          cloudWmsId: cloudWmsOrShopId,
          courierId: value,
          cpCode: options?.key,
          postFee: options?.children && options?.children[2] ? options?.children[2] : 0,
        });
      }
    } else {
      const index = this.shopFeeParams.findIndex((item) => item.shopId === cloudWmsOrShopId);
      if (index > -1) {
        this.shopFeeParams[index].courierId = value;
        this.shopFeeParams[index].cpCode = options?.key;
        this.shopFeeParams[index].postFee = options?.children && options.children[2] ? options.children[2] : 0;
      } else {
        this.shopFeeParams.push({
          shopId: cloudWmsOrShopId,
          courierId: value,
          cpCode: options?.key,
          postFee: options?.children && options?.children[2] ? options?.children[2] : 0,
        });
      }
    }
    this.courierFeePrice = this.feeParams.concat(this.shopFeeParams).reduce((acc, pre) => {
      return acc + pre.postFee;
    }, 0);
  };

  // 支付
  @action public CreateMallOrder = () => {
    console.log(this.feeParams, this.shopFeeParams, this.wmsSkuInfoVoList);
    if ((this.feeParams.length + this.shopFeeParams.length) !== this.wmsSkuInfoVoList.length) {
      message.warning('请选择运费！');
      return;
    }

    const createOrderFn = async(disableBaitiao: 0 | 1) => {
      try {
        this.loadingVisible = true;
        this.feeParams.concat(this.shopFeeParams).forEach((item) => {
          delete item.postFee;
        });
        const mallReturnPolicyTos = this.selectedGoodsList.map((item) => {
          return {
            goodsId: item.goodsId,
            returnNumber: item.goodsNum,
          };
        });

        const saleOrderParams = this.ids.map((item, index) => {
          return {
            saleOrderId: item,
            saleOrderTenantId: this.tenantIds[index],
          };
        });
        const params = {
          feeParams: this.feeParams,
          mallReturnPolicyTos,
          saleOrderParams,
          needValueAddService: !this.closeFlag,
          shopFeeParams: this.shopFeeParams,
        };

        const { data } = await request<BaseData<OrderList[]>>({
          url: api.createMallOrder,
          method: 'POST',
          data: params,
        });
        const tradeOrderIds = [];
        data.forEach((item) => {
          if (item.tradeOrderId) {
            tradeOrderIds.push(item.tradeOrderId);
          }
          if (item.carelessTradeOrderId) {
            tradeOrderIds.push(item.carelessTradeOrderId);
          }
        });

        const cashierCode = this.fromPageType === '2' ? 'finance-chain-pc-cashier' : 'one-piece-consignment-cashier';
        console.log(`/jumai-ts-vogue/cashier/index?cashierCode=${cashierCode}&tradeOrderIds=${JSON.stringify(tradeOrderIds)}&noRealName=1&disableBaitiao=${disableBaitiao}`);
        window.top.egenie.openTab(`/jumai-ts-vogue/cashier/index?cashierCode=${cashierCode}&tradeOrderIds=${JSON.stringify(tradeOrderIds)}&noRealName=1&disableBaitiao=${disableBaitiao}`, 'cashier', '收银台');
        window.top.egenie.closeTab('wholeSalePage');
      } catch (error) {
        /** 存在已代发未付款的订单，提示用户去付款 */
        const isProxySendUnPay = error.data?.code === 6000001;
        if (isProxySendUnPay) {
          message.destroy();
          Modal.confirm({
            title: '选择的订单中有已代发-未付款的，请去“我的订单”付款',
            okText: '去付款',
            onOk: () => {
              window.top.egenie.openTab('/jumai-ts-vogue/myorder/index?orderStatus=0', 753, '我的订单');
            },
          });
        }
      } finally {
        this.loadingVisible = false;
      }
    };

    let showLimitPriceTip = false;
    let showLimitSalePrice = false;

    const cloudWmsItems = this.wmsSkuInfoVoList.filter((item) => item.cloudWmsId);
    showLimitPriceTip = cloudWmsItems.some((item) => {
      return item.skuVoList.some((eachSku) => {
        return eachSku.limitPriceTips;
      });
    });

    showLimitSalePrice = cloudWmsItems.some((item) => {
      return item.skuVoList.some((eachSku) => {
        return eachSku.limitSalePriceTips;
      });
    });

    if (showLimitPriceTip || showLimitSalePrice) {
      Modal.confirm({
        title: '商品存在以下问题',
        content: tipContent(showLimitPriceTip, showLimitSalePrice),
        okText: '确认支付',
        onOk: () => {
          createOrderFn(1);
        },
      });
    } else {
      createOrderFn(0);
    }
  };

  // 无忧退货回调
  @action public setSelectedWorryFreeList = (selectedList: GoodsVos[], totalAmount: number) => {
    this.selectedGoodsList = selectedList;
    this.returnServicePrice = totalAmount;
  };

  public worryFreePurchaseStore = new WorryFreePurchaseStore({
    parent: this,
    frontOrBack: 'back',
    confirmCallBack: this.setSelectedWorryFreeList,
  });
}

