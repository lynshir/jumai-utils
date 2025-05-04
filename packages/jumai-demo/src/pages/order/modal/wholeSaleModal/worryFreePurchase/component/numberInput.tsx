import { Button, InputNumber } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

export const NumberInput: React.FC<{
  id?: number | string;
  value?: number;
  frontOrBack?: 'front' | 'back';
  maxNumber?: number;
  onInputNumberChange?: (value: number, type: 'minus' | 'plus' | 'change', id: number | string) => void;
}> = observer((props) => {
  const { onInputNumberChange,
    frontOrBack,
    value,
    id,
    maxNumber } = props;

  return (
    <div className={`${styles.customNumWrap} ${(!frontOrBack || frontOrBack === 'back') ? '' : styles.front}`}>
      <Button
        disabled={value <= 1}
        onClick={() => {
          onInputNumberChange(value - 1, 'minus', id);
        }}
      >
        -
      </Button>
      <InputNumber
        className={styles.inputNumber}
        max={maxNumber}
        min={1}
        onBlur={(event) => onInputNumberChange(Number(event.target?.value), 'change', id)}
        precision={0}
        style={{ width: 60 }}
        value={value}
      />
      <Button
        disabled={value === maxNumber}
        onClick={() => {
          onInputNumberChange(value + 1, 'plus', id);
        }}
      >
        +
      </Button>
    </div>
  );
});
