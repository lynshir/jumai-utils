import { Modal, Form, InputNumber } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './byPercentageSplitStore';

@observer
export default class BySkuSplitModal extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { byPercentageVisible, splitStockPercentage, handlePercentageSplit, onChange, closeModal } = this.props.store;
    return (
      <Modal
        maskClosable={false}
        okText="保存"
        onCancel={closeModal}
        onOk={handlePercentageSplit}
        open={byPercentageVisible}
        title="按比例拆分"
        width={560}
      >
        <div>
          将按照
          <InputNumber
            formatter={(value) => `${value ? Number(value) : value}`}

            // defaultValue={splitStockPercentage}
            max={100}
            min={0}
            onChange={onChange}
            parser={(value) => value.replace('%', '')}
            precision={1}
            value={splitStockPercentage}
          />
          %对有货货品进行拆分
        </div>
      </Modal>
    );
  }
}
