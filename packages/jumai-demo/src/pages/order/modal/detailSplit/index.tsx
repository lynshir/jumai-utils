import { Modal, Form, Select, Input } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './store';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@observer
export default class extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { modalVisible, confirmLoading, closeModal, handleSplit, detailText, handleTextChange } = this.props.store;
    return (
      <Modal
        confirmLoading={confirmLoading}
        maskClosable={false}
        onCancel={closeModal}
        onOk={handleSplit}
        open={modalVisible}
        title="提示"
      >
        <div style={{ marginBottom: '4px' }}>
          订单将会被按明细条数拆分成多个订单，请在下方输入框中输入“确认拆分”后点击确定完成拆分。
        </div>
        <Input
          onChange={handleTextChange}
          onPressEnter={handleSplit}
          placeholder="请先输入确认拆分，再点击确定按钮"
          value={detailText}
        />
      </Modal>
    );
  }
}
