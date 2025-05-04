import { Modal, Form, Select, Input } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './modifyRemarkStore';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@observer
export default class ModifyRemarkModal extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { remarkKey, loading, modalVisible, formRef, closeModal, submitModifyInfo, remarkInfo } = this.props.store;
    return (
      <Modal
        confirmLoading={loading}
        maskClosable={false}
        onCancel={closeModal}
        onOk={submitModifyInfo}
        open={modalVisible}
        title={remarkInfo[remarkKey].title}
        width={560}
      >
        <Form
          ref={formRef}
          {...formLayout}
        >
          <Item
            label={remarkInfo[remarkKey].label}
            name={remarkInfo[remarkKey].key}
          >
            <Input/>
          </Item>
        </Form>
      </Modal>
    );
  }
}
