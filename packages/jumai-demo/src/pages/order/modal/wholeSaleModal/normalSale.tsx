import { Button, Select } from 'antd';
import { add, toFixed } from 'jumai-common';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';
import type WholeSaleStore from './store';
import { ValueAddedService } from './components';
import type { PerBillingProjectCostsVO } from './interface';

const { Option } = Select;

// 普通代发内容
export const NormalSaleContent: React.FC<{ store: WholeSaleStore; }> = observer((props) => {
  const {
    wmsSkuInfoVoList,
    courierFeePrice,
    toggleValueAddVos,
    wholesaleParams: {
      totalNum,
      goodsPrice,
    },
    CreateMallOrder,
    onSelectPostFee,
    closeFlag,
    valueAddFee,
    toggleActivationGuide,
    valueAddVos,
  } = props.store;

  const feeWithoutValueAdd = add(goodsPrice, courierFeePrice);

  const allPlatformFinanceServiceAmount = wmsSkuInfoVoList.reduce((accu, cur) => {
    return add(accu, cur.platformFinanceServiceAmount || 0);
  }, 0);

  const feeWithPlatFee = add(feeWithoutValueAdd, allPlatformFinanceServiceAmount);

  // 带增值服务
  const feeWithValueAdd = add(feeWithPlatFee, valueAddFee);
  let total = 0;
  if (Array.isArray(wmsSkuInfoVoList) && wmsSkuInfoVoList.length > 0) {
    wmsSkuInfoVoList.forEach((item) => {
      // perBillingProjectCosts（其他前置计费的费用,如作业费、耗材费等）
      total += item.perBillingProjectCosts ? item.perBillingProjectCosts?.reduce((pre, next) => {
        return pre + next.amount;
      }, 0) : 0;
      console.log('total....', total);
    });
  }
 
  const preFeesList = [];
  if (Array.isArray(wmsSkuInfoVoList) && wmsSkuInfoVoList.length > 0) {
    wmsSkuInfoVoList.forEach((item) => {
      item?.perBillingProjectCosts?.forEach((preItem) => {
        const matchedItem = preFeesList.find((e) => e.productName === preItem.productName);
        if (matchedItem) {
          matchedItem.amount += preItem.amount;
        } else {
          preFeesList.push({
            productName: preItem.productName,
            amount: preItem.amount,
          });
        }
      });
    });
    console.log('preFeesList....', preFeesList);
  }
  
  const renderItem = (item: PerBillingProjectCostsVO[]) => {
    return item?.map(({
      productName,
      amount,
    }) => {
      return (
        <div
          className={styles.platformServiceFee}
          key={productName}
        >
          {productName}
          ：¥
          {amount}
        </div>
      );
    });
  };
  const renderTotalFeeList = (item: any) => {
    return item.map(({
      productName,
      amount,
    }) => {
      return (
        <span key={productName}>
          {productName}
          ：&yen;
          {toFixed(amount, 2)}
        </span>
      );
    });
  };
  return (
    <div className={styles.wholesaleBody}>
      <div className={styles.wholesaleMainPart}>
        {/* 增值服务 */}
        <ValueAddedService
          closeFlag={closeFlag}
          isQuickSale={false}
          openSetService={props.store.setValueAddedServiceStore.show.bind(props.store.setValueAddedServiceStore)}
          toggleActivationGuide={toggleActivationGuide}
          toggleValueAddVos={toggleValueAddVos}
          valueAddVos={valueAddVos}
        />

        {/* 按仓库拆分 */}
        {wmsSkuInfoVoList.map((item) => {
          return (
            <div key={item.cloudWmsId}>
              <div
                className={styles.wareHouse}
              >
                <span>
                  {item.cloudWmsId ? '网仓' : '供应商'}
                  ：
                  {item.cloudWmsId ? item.cloudWmsName : item.shopName}
                </span>
                <div
                  className={styles.warehouseMark}
                  style={{
                    color: `${item.cloudWmsId ? '#FF9948' : '#02C190'}`,
                    background: `${item.cloudWmsId ? '#FF99481a' : '#02C1901a'}`,
                  }}
                >
                  {item.cloudWmsId ? '聚麦网仓代发' : '供应商代发'}
                </div>
              </div>
              <div className={styles.egGridModel}>
                <EgGrid store={item.egGridModel}/>
              </div>
              <div className={styles.freightWrapper}>
                运费：
                <Select
                  className={styles.freight}
                  defaultValue={item.defaultCourier}
                  onSelect={(value, option) => {
                    onSelectPostFee(value, option, item.cloudWmsId || item.shopId, `${item.cloudWmsId ? 'cloud' : 'vendor'}`);
                  }}
                  size="small"
                >
                  {item.courierFeeTos.map((el) => {
                    return (
                      <Option
                        key={el.cpCode}
                        value={el.courierId}
                      >
                        {el.courierName}
                        (
                        {el.postFee}
                        元)
                      </Option>
                    );
                  })}
                </Select>
                {
                  (item.cloudWmsId && item.platformFinanceServiceAmount) ? (
                    <div className={styles.platformServiceFee}>
                      平台服务费：¥
                      {' '}
                      {toFixed(item.platformFinanceServiceAmount, 2)}
                    </div>
                  ) : null
                }
                {renderItem(item.perBillingProjectCosts)}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.wholesaleBodyFooter}>
        <div className={styles.price}>
          <span className={styles.totalPrice}>
            （共代发
            {totalNum}
            件
            ）
            <span>
              &yen;
              {closeFlag ? toFixed((feeWithPlatFee + total), 2) : toFixed((feeWithValueAdd + total), 2)}
            </span>
          </span>
          <div className={styles.servicePrice}>
            <span>
              商品金额：&yen;
              {toFixed(goodsPrice, 2)}
            </span>
            <span>
              运费
              ：&yen;
              {toFixed(courierFeePrice, 2)}
            </span>
            {!closeFlag ? (
              <span>
                增值服务费：&yen;
                {toFixed(valueAddFee, 2)}
              </span>
            ) : null}
            {
              typeof (allPlatformFinanceServiceAmount) == 'number' && allPlatformFinanceServiceAmount > 0 ? (
                <span>
                  平台服务费：&yen;
                  {toFixed(allPlatformFinanceServiceAmount, 2)}
                </span>
              ) : null
            }
            {preFeesList && preFeesList.length > 0 && (
              <div className={styles.servicePrice}>
                {renderTotalFeeList(preFeesList)}
              </div>
            )}
          </div>
        </div>
        <Button
          className={styles.payment}
          onClick={CreateMallOrder}
          size="large"
          type="primary"
        >
          立即下单
        </Button>
      </div>
    </div>
  );
});
