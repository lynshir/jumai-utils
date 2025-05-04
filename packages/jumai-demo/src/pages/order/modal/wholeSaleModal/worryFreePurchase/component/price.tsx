import { toFixed } from 'jumai-common';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

const handlePrice = (price: number): { intPart: string; decimalPart: string; } => {
  const [
    intPart,
    decimalPart,
  ] = toFixed(price, 2).split('.');
  return {
    intPart,
    decimalPart,
  };
};

export const Price: React.FC<{ price: number; }> = observer((props) => {
  const { price } = props;
  const { intPart, decimalPart } = handlePrice(price || 0);
  return (
    <div className={styles.showPrice}>
      <span className={styles.priceIcon}>
        ¥
      </span>
      <span className={styles.intPart}>
        {intPart}
        .
      </span>
      <span className={styles.decimalPart}>
        {decimalPart}
      </span>
    </div>
  );
});
