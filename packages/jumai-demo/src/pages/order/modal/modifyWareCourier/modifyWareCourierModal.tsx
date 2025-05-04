import { Modal, Form, Select } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './modifyWareCourierStore';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@observer
export default class ModifyWareCourier extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { modalVisible, loading, formRef, closeModal, submitModifyInfo, warehouseOptions, courierOptions } = this.props.store;
    return (
      <Modal
        confirmLoading={loading}
        maskClosable={false}
        onCancel={closeModal}
        onOk={submitModifyInfo}
        open={modalVisible}
        title="仓库和快递公司修改"
        width={560}
      >
        <Form
          ref={formRef}
          {...formLayout}
        >
          <Item
            label="仓库"
            name="wareHouseId"
          >
            <Select
              optionFilterProp="label"
              options={warehouseOptions}
              showSearch
            />
          </Item>
          <Item
            label="快递公司"
            name="courierId"
          >
            <Select
              optionFilterProp="label"
              options={courierOptions}
              showSearch
            />
          </Item>
        </Form>
      </Modal>
    );
  }
}
