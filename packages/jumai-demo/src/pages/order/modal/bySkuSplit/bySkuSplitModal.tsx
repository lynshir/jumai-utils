import { Modal, Button, Form, Select, Input, Row, Col } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './bySkuSplitStore';

const { Item } = Form;

@observer
export default class BySkuSplitModal extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { bySkuSplitVisible, confirmLoading, queryRef, queryProductList, productGrid, handleBySkuSplit, closeModal } = this.props.store;
    return (
      <Modal
        confirmLoading={confirmLoading}
        maskClosable={false}
        okText="保存"
        onCancel={closeModal}
        onOk={handleBySkuSplit}
        open={bySkuSplitVisible}
        title="按SKU拆分"
        width={1000}
        zIndex={1400}
      >
        <Form ref={queryRef}>
          <Row>
            <Col span={3}>
              <Item
                initialValue="skuNo"
                name="key"
              >
                <Select
                  dropdownStyle={{ zIndex: 1401 }}
                  options={selectOptions}
                />
              </Item>
            </Col>
            <Col span={6}>
              <Item name="value">
                <Input/>
              </Item>
            </Col>
            <Col span={2}>
              <Item>
                <Button
                  onClick={queryProductList}
                  type="primary"
                >
                  查询
                </Button>
              </Item>
            </Col>
            <Col/>
          </Row>
        </Form>
        <div style={{ height: '300px' }}>
          <EgGrid store={productGrid}/>
        </div>
      </Modal>
    );
  }
}

const selectOptions = [
  {
    label: 'SKU编码',
    value: 'skuNo',
  },
  {
    label: '商品编码',
    value: 'productNo',
  },
];
