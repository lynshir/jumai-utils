import { ExclamationCircleOutlined } from '@ant-design/icons';
import { InputNumber, Modal } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './index.less';
import type Store from './model';

@observer
export default class ByWeight extends Component<{ store: Store; }> {
  render() {
    const { visible, onCancel, onOk, setLimitWeight, limitWeight, confirmLoading } = this?.props?.store;
    return (
      <Modal
        centered
        confirmLoading={confirmLoading}
        onCancel={onCancel}
        onOk={onOk}
        open={visible}
        title="按重量拆分"
      >
        <div className={styles.page}>
          <span className={styles.prompt}>
            <ExclamationCircleOutlined className={styles.promptIcon}/>
            选中的订单将按照设定的重量拆分成多个订单，操作不可逆，请谨慎操作。
          </span>
          <div className={styles.kg}>
            <span>
              限定每个订单重量不能大于
            </span>
            <InputNumber
              className={styles.inputNumber}
              max={99999}
              min={0}
              onChange={(value) => {
                setLimitWeight(value);
              }}
              precision={2}
              value={limitWeight}
            />
            <span>
              kg
            </span>
          </div>
        </div>
      </Modal>
    );
  }
}
