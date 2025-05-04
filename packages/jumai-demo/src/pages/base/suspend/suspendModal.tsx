import { Modal, Form, Select, Input } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './suspendStore';

const { Item } = Form;
const { TextArea } = Input;

@observer
export default class SuspendReasonModal extends Component<{ store?: Store ; }> {
  render(): ReactNode {
    const { visible, suspendFormRef, confirmLoading, suspendTypeList, closeSuspendReasonModal, submitSuspendInfo } = this.props.store;
    return (
      <Modal
        confirmLoading={confirmLoading}
        maskClosable={false}
        onCancel={closeSuspendReasonModal}
        onOk={submitSuspendInfo}
        open={visible}
        title="挂起原因"
        width={400}
      >
        <Form ref={suspendFormRef}>
          <Item
            label="挂起原因"
            name="type"
          >
            <Select
              options={suspendTypeList}
            />
          </Item>
          <Item
            label="挂起说明"
            name="reason"
          >
            <TextArea/>
          </Item>
        </Form>
      </Modal>
    );
  }
}

