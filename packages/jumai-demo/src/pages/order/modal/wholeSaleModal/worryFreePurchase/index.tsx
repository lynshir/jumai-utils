import { Button, Checkbox, Drawer } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';
import type { WorryFreePurchaseStore } from './store';
import { Table } from './tableContent';

export const WorryFreePurchase: React.FC<{ store: WorryFreePurchaseStore; }> = observer((props) => {
  const { frontOrBack, visible, onClose, checkedAll, onClickCheckAll, worryFreeGoodsTotal, onConfirm } = props.store;
  return (
    <Drawer
      className={`${styles.drawer} ${frontOrBack === 'back' ? '' : styles.front}`}
      maskClosable
      onClose={onClose}
      open={visible}
      width={890}
    >
      <div className={`${styles.container}`}>
        <div className={styles.header}>
          <h4 className={styles.title}>
            无忧退货
          </h4>
          <p>
            ·  购买服务15天内可无理由退货，不限颜色尺码
          </p>
          <p>
            ·  服务费按件计算，请按需购买
          </p>

        </div>
        <div className={styles.tableContent}>
          <Table store={props.store}/>
        </div>
      </div>
      <div className={styles.submitArea}>
        <div className={styles.selectAll}>
          <Checkbox
            checked={checkedAll === 'all'}
            indeterminate={checkedAll === 'indeterminate'}
            onClick={onClickCheckAll}
          >
            全选
          </Checkbox>
        </div>
        <div className={styles.resultRight}>
          <div className={styles.totalCount}>
            {`无忧退货${worryFreeGoodsTotal.totalNum}件，`}
          </div>
          <div className={styles.totalPrice}>
            {`¥${worryFreeGoodsTotal.totalAmount}`}
          </div>
          <Button
            onClick={onConfirm}
            type="primary"
          >
            确定
          </Button>
        </div>
      </div>
    </Drawer>
  );
});
