
import { Input } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { copyMethods } from '../../../../../utils';
import styles from './index.less';

interface PriceInputPropsInterface {
  value?: string;
  onChange?: (value: string) => void;
}

@observer
export default class CopyComponents extends Component<PriceInputPropsInterface> {
  render() {
    const { value } = this.props;
    return (
      <div className={styles.itemCopy}>
        <Input
          disabled
          value={value}
        />
        <span
          className={`icon-copy ${styles.copy}`}
          onClick={() => {
            value && copyMethods(value);
          }}
        />
      </div>
    );
  }
}
