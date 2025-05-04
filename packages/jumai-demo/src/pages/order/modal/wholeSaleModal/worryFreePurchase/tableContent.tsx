import { Checkbox } from 'antd';
import { ImgFormatter } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import { getPrice } from '../../../../../utils';
import { NumberInput } from './component/numberInput';
import { Price } from './component/price';
import styles from './index.less';
import type { WorryFreePurchaseStore } from './store';

export const Table: React.FC<{ store: WorryFreePurchaseStore; }> = observer((props) => {
  const { worryFreeGoodsList, onInputNumberChange, onCheckSku, selectedGoodsList, checkedAll, onClickCheckAll } = props.store;
  return (
    <div className={styles.table}>
      <header className={styles.tableHeader}>
        <div className={styles.headerCheckBox}>
          <Checkbox
            checked={checkedAll === 'all'}
            indeterminate={checkedAll === 'indeterminate'}
            onClick={onClickCheckAll}
          >
            全选
          </Checkbox>
        </div>
        <div className={styles.headerGoodsInfo}>
          商品信息
        </div>
        <div className={styles.headerPrice}>
          单价
        </div>
        <div className={styles.headerCount}>
          数量
        </div>
      </header>
      <div className={styles.tableBody}>
        {worryFreeGoodsList?.map((el) => {
          return (
            <div
              className={styles.tableRow}
              key={el.goodsId}
            >
              <div className={styles.checkbox}>
                <Checkbox
                  checked={selectedGoodsList.includes(el.goodsId)}
                  onChange={() => {
                    onCheckSku(el.goodsId);
                  }}
                />
              </div>
              <div className={styles.goodsInfo}>
                <div className={styles.imgFormatter}>
                  <ImgFormatter
                    height={56}
                    value={el.picUrl}
                    width={56}
                  />
                </div>
                <div className={styles.goodsName}>
                  {el.goodsName}
                </div>
              </div>
              <div className={styles.price}>
                <Price price={getPrice(el.price, el.skuActivityPrice, el.skuDiscountPrice)}/>
                <div>
                  <span className={styles.careFreeLabel}>
                    无忧退货服务费
                  </span>
                  <span className={styles.careFreePrice}>
                    {`¥${el.worryFreeCost}/件`}
                  </span>
                </div>
              </div>
              <div className={styles.count}>
                <span className={styles.countTips}>
                  {`可选${el.worryFreeNum}件`}
                </span>
                <NumberInput
                  frontOrBack="front"
                  id={el.goodsId}
                  maxNumber={el.worryFreeNum}
                  onInputNumberChange={onInputNumberChange}
                  value={el.goodsNum}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
