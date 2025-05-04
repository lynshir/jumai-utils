import { Modal, Form, Radio } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { PreShipmentModel } from './model';

@observer
export class PreShipment extends Component<{ store?: PreShipmentModel ; }> {
  render(): JSX.Element {
    const { visible, preShipmentFormRef, selectNum, platformPreShipmentType, closePreShipmentModal, submitPreShipmentInfo } = this.props.store;
    return (
      <Modal
        maskClosable={false}
        onCancel={closePreShipmentModal}
        onOk={submitPreShipmentInfo}
        open={visible}
        title="预发货"
        width={400}
      >
        <div>
          <p>
            请选择需要执行平台预发货的订单范围：
          </p>
          <Form
            ref={preShipmentFormRef}
          >
            <Form.Item
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
                      {item.description === '选中的订单' ? `(${selectNum}条)` : ''}
                    </Radio>
                  ))
                }
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
}

