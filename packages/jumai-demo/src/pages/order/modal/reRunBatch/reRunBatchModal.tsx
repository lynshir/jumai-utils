import { Modal, Form, Select, Checkbox, Radio } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './reRunBatchStore';

const { Item } = Form;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@observer
export default class reRunBatchModal extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { modalVisible, formRef, selectNum, platformPreShipmentType, confirmLoading, closeModal, submitModifyInfo, saveDisabled, serviceType, handleFieldChange } = this.props.store;
    return (
      <Modal
        confirmLoading={confirmLoading}
        forceRender
        maskClosable={false}
        okButtonProps={{ disabled: saveDisabled }}
        onCancel={closeModal}
        onOk={submitModifyInfo}
        open={modalVisible}
        title="重算订单"
        width={560}
      >
        <Form
          colon={false}
          ref={formRef}
          {...formLayout}
          onFieldsChange={handleFieldChange}
        >
          <p>
            1.选择执行重算的订单
          </p>
          <Item
            initialValue={!selectNum ? 2 : 1}
            name="preLogisticType"
          >
            <Radio.Group>
              {
                platformPreShipmentType.map((item) => (
                  <Radio
                    disabled={!selectNum && item.description === '选中的订单'}
                    key={item.type}
                    value={item.type}
                  >
                    {item.description}
                    {item.description === '选中的订单' ? `(${selectNum}单)` : ''}
                  </Radio>
                ))
              }
            </Radio.Group>
          </Item>
          <p>
            2.选择执行重算的服务类型
          </p>
          <Item
            name="serviceType"
          >
            <Checkbox.Group value={serviceType}>
              <Checkbox value="warehouse">
                重算分仓
              </Checkbox>
              <Checkbox value="courier">
                重算快递
              </Checkbox>
              <Checkbox value="combineProduct">
                重算组合
              </Checkbox>
            </Checkbox.Group>
          </Item>
        </Form>
      </Modal>
    );
  }
}
