import React from 'react';
import { Modal, Radio, Space } from 'antd';
import type Store from './store';
import { observer } from 'mobx-react';

export const DropShippingTipModal: React.FC<{ store: Store; }> = observer((props) => {
  const { visible, toggleDropModal, value, selectedOrderDisabled, handleValueChange, handleOk } = props.store;
  return (
    <Modal
      bodyStyle={{ padding: '16px 16px 50px' }}
      maskClosable={false}
      onCancel={toggleDropModal.bind(this, false)}
      onOk={handleOk}
      open={visible}
      title="代发"
    >
      <Radio.Group
        onChange={(e) => {
          handleValueChange(e.target.value);
        }}
        value={value}
      >
        <Space
          direction="vertical"
          size="large"
        >
          <Radio
            disabled={selectedOrderDisabled}
            value={1}
          >
            选中的订单
          </Radio>
          <Radio value={2}>
            符合当前查询条件的订单
          </Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
});
