import React from 'react';
import styles from './index.less';
import type { BaseData } from 'jumai-common';
import { add, request, toFixed } from 'jumai-common';
import { Button, message } from 'antd';
import { observable, action, flow, computed } from 'mobx';
import { observer } from 'mobx-react';
import type { QuickSaleInfo, QuickCreateMallOrder } from './interface';
import { api } from '../../../../utils';
import { ValueAddedService } from './components';

export class QuickSaleStore {
  constructor(options) {
    this.parent = options.parent;
  }

  public parent;

  public wholeSaleQuickCacheId = '';// 付款单缓存id

  @observable public payDisabled = false;

  @observable public closeFlag = false;// 关闭增值服务

  @observable public valueAddFee = 0;// 增值服务费

  @observable public wholeSaleQuickAmountVo = {
    orderNum: 0,
    platformServiceAmount: 0,
    skuNum: 0,
    totalAmount: 0,
    valueAddServiceAmount: 0,
    wholeSaleServiceAmount: 0,
  };

  @computed public get allTotalAmountWithoutValueAdd() {
    const { platformServiceAmount,
      totalAmount,
      wholeSaleServiceAmount } = this.wholeSaleQuickAmountVo;
    return add(platformServiceAmount, add(totalAmount, wholeSaleServiceAmount));// 无增值服务费
  }

  @computed public get allTotalAmount() {
    const { valueAddServiceAmount } = this.wholeSaleQuickAmountVo;
    return add(valueAddServiceAmount, this.allTotalAmountWithoutValueAdd);
  }
  
  // 关闭/打开增值服务
  @action public toggleCloseFlag = (visible: boolean) => {
    this.closeFlag = visible;
  };

  // 立即支付生成付款单
  @action public createMallOrder = async() => {
    this.parent.loadingVisible = true;
    try {
      const res = await request<BaseData<QuickCreateMallOrder>>({
        url: api.createQuicklyOrder,
        method: 'POST',
        data: {
          needValueAddService: !this.closeFlag,
          wholeSaleQuickCacheId: this.wholeSaleQuickCacheId,
        },
      });

      const { callBackUrl, orderNum, outBatchNo } = res.data;

      const cashierCode = this.parent.fromPageType === '2' ? 'finance-chain-pc-cashier' : 'one-piece-consignment-cashier';

      console.log(`/jumai-ts-vogue/cashier/index?cashierCode=${cashierCode}&outBatchNo=${outBatchNo}&orderNum=${orderNum}&callBackUrl=${callBackUrl}&noRealName=1`);
      window.top.egenie.openTab(`/jumai-ts-vogue/cashier/index?cashierCode=${cashierCode}&outBatchNo=${outBatchNo}&orderNum=${orderNum}&callBackUrl=${callBackUrl}&noRealName=1`, 'cashier', '收银台');
    } catch (e) {
      console.log(e);
    } finally {
      this.parent.loadingVisible = false;
    }
  };

  // 初始化数据
  public initData = flow(function* (pageType, vo) {
    this.parent.spinning = true;
    try {
      const res = yield request<BaseData<QuickSaleInfo>>({
        url: api.queryQuicklyData,
        method: 'POST',
        data: {
          pageType,
          vo,
        },
      });

      this.parent.spinning = false;
      if (Array.isArray(res.data?.goodsExceptionInfos) && res.data.goodsExceptionInfos.length > 0) {
        this.payDisabled = true;

        const info = `商品信息异常：${res.data.goodsExceptionInfos.join('，')}`;
        message.error(info);
      } else {
        const { orderNum, platformServiceAmount, skuNum, totalAmount, valueAddServiceAmount, wholeSaleServiceAmount } = res.data.wholeSaleQuickAmountVo;
        this.wholeSaleQuickAmountVo = {
          orderNum,
          platformServiceAmount,
          skuNum,
          totalAmount,
          valueAddServiceAmount,
          wholeSaleServiceAmount,
        };

        // 缓存id
        this.wholeSaleQuickCacheId = res.data.wholeSaleQuickCacheId;
      }
    } catch (e) {
      console.log(e);
      this.payDisabled = true;
    } finally {
      this.parent.loading = false;
    }
  });
}

// 极速代发
export const QuickSaleContent: React.FC<{ store: QuickSaleStore; }> = observer((props) => {
  const { closeFlag, toggleCloseFlag, createMallOrder, wholeSaleQuickAmountVo, payDisabled, allTotalAmountWithoutValueAdd, allTotalAmount } = props.store;
  const { orderNum,
    platformServiceAmount,
    skuNum,
    totalAmount,
    valueAddServiceAmount,
    wholeSaleServiceAmount } = wholeSaleQuickAmountVo;
  
  return (
    <div className={styles.wholesaleBody}>
      <div className={styles.wholesaleMainPart}>
        {/* 增值服务 */}
        <ValueAddedService
          closeFlag={closeFlag}
          isQuickSale
          toggleValueAddVos={toggleCloseFlag}
        />
        <div className={styles.quickSalePredict}>
          本次预计代发
          <div className={styles.quickSalePredictText}>
            <span>
              {orderNum}
            </span>
            单，
            <span>
              {skuNum}
            </span>
            件商品
          </div>
        </div>
        <div>
          代发说明
          <div>
            1、当前页面展示的是系统预估费用，实际付款金额以收银台页面为准
          </div>
          <div>
            2、点击【立即支付】后系统会计算实际应付金额，所需时间较长，加载过程中请不要关闭当前页面
          </div>
        </div>
      </div>
      
      <div className={styles.wholesaleBodyFooter}>
        <div className={styles.price}>
          <span className={styles.totalPrice}>
            应付总金额（预估）
            <span>
              &yen;
              {closeFlag ? toFixed(allTotalAmountWithoutValueAdd, 2) : toFixed(allTotalAmount, 2)}
            </span>
          </span>
          <div className={styles.servicePrice}>
            <span>
              商品金额：&yen;
              {toFixed(totalAmount, 2)}
            </span>
            <span>
              运费
              ：&yen;
              {toFixed(wholeSaleServiceAmount, 2)}
            </span>
            {!closeFlag ? (
              <span>
                增值服务费：&yen;
                {toFixed(valueAddServiceAmount, 2)}
              </span>
            ) : null}
            <span>
              平台服务费：&yen;
              {toFixed(platformServiceAmount, 2)}
            </span>
          </div>
        </div>
        <Button
          className={styles.payment}
          disabled={payDisabled}
          onClick={createMallOrder}
          size="large"
          type="primary"
        >
          立即下单
        </Button>
      </div>
    </div>
  );
});
