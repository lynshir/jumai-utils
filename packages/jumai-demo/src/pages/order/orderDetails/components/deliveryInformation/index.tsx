import { Select, Form, Row, Col, Input } from 'antd';
import { values } from 'mobx';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import Collapse from '../collapse/index';
import CopyComponents from '../copy/index';
import type store from './model';

const { Item } = Form;
interface Interface {
  store: store;
}

@observer
export default class extends Component<Interface> {
  render() {
    const { formRef, warehouseList, courierList, updateWarehouseOrDelivery, parent: { isChecked }} = this.props.store;
    return (
      <Form
        labelCol={{ span: 5 }}
        ref={formRef}
        wrapperCol={{ span: 19 }}
      >
        <Collapse title="发货信息">
          <Row>
            <Col span={6}>
              <Item
                label="订单类型"
                name="orderTypeDesc"
              >
                <Input disabled/>
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="仓库"
                name="warehouseId"
              >
                <Select
                  disabled={isChecked}
                  onChange={(id) => {
                    updateWarehouseOrDelivery(id, 1);
                  }}
                  optionFilterProp="label"
                  options={warehouseList}
                  showSearch
                />
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="快递"
                name="courierId"
              >
                <Select
                  disabled={isChecked}
                  onChange={(id) => {
                    updateWarehouseOrDelivery(id, 2);
                  }}
                  optionFilterProp="label"
                  options={courierList}
                  showSearch
                />
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="快递单号"
                name="courierOrderNo"
              >
                <CopyComponents/>
              </Item>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Item
                label="重量"
                name="weight"
              >
                <Input disabled/>
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="截止发货时间"
                name="deadlineLogisticsTime"
              >
                <Input disabled/>
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="订单时效"
                name="cnServiceDesc"
              >
                <Input disabled/>
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="采购状态"
                name="purchaseStateDesc"
              >
                <Input disabled/>
              </Item>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Item
                label="组号"
                name="groupNo"
              >
                <Input disabled/>
              </Item>
            </Col>
          </Row>
        </Collapse>
      </Form>
    );
  }
}
