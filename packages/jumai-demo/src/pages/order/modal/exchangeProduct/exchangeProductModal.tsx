import { WarningFilled } from '@ant-design/icons';
import { Modal, Button, Form, Select, Input, Row, Col, Checkbox, Space } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './exchangeProductStore';

const { Item } = Form;
@observer
export default class AddProductModal extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { exchangeProductVisible, queryRef, queryProductList, productGrid, handleExchangeProduct, closeExchangeProcutModal, submitLoading } = this.props.store;
    return (

      <Modal
        confirmLoading={submitLoading}
        forceRender
        maskClosable={false}
        okText="保存"
        onCancel={closeExchangeProcutModal}
        onOk={handleExchangeProduct}
        open={exchangeProductVisible}
        title="换商品"
        width={1200}
        zIndex={1400}
      >
        <Form
          colon={false}
          labelCol={{ span: 10 }}
          onFinish={queryProductList}
          ref={queryRef}
          wrapperCol={{ span: 14 }}
        >
          <Row>
            <Col span={4}>
              <Item
                label="商品编码"
                name="productNo"
              >
                <Input placeholder="请输入"/>
              </Item>
            </Col>
            <Col span={4}>
              <Item
                label="SKU编码"
                name="skuNo"
              >
                <Input placeholder="请输入"/>
              </Item>
            </Col>
            <Col span={4}>
              <Item
                label="条形码"
                name="barCode"
              >
                <Input placeholder="请输入"/>
              </Item>
            </Col>
            <Col
              span={4}
            >
              <Item
                label=" "
                labelCol={{ span: 4 }}
                name="skuType"
                valuePropName="checked"
                wrapperCol={{ span: 20 }}
              >
                <Checkbox
                  onChange={queryProductList}
                  style={{ marginTop: '5px' }}
                >
                  组合商品
                </Checkbox>
              </Item>
            </Col>
            <Col span={0} style={{ display: 'none' }}>
              <Item
                label="仓库id"
                name="warehouseId"
              >
                <Input placeholder="请输入"/>
              </Item>
            </Col>
            <Col
              offset={4}
              span={4}
            >
              <Space align="end">
                <Button onClick={() => queryRef?.current?.resetFields()}>
                  重置
                </Button>
                <Button
                  htmlType="submit"
                  type="primary"
                >
                  查询
                </Button>
              </Space>
            </Col>

          </Row>
          <div style={{ height: '300px' }}>
            <EgGrid store={productGrid}/>
          </div>
        </Form>
      </Modal>

    );
  }
}
