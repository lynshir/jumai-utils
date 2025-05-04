import { Modal, Button, Form, Select, Input, Row, Col, Checkbox } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import type { ReactNode } from 'react';
import React, { Component } from 'react';
import type Store from './model';
import styles from './index.less';

const { Item } = Form;
@observer
export default class AddProduct extends Component< { store: Store; }> {
  render(): ReactNode {
    const { addProductVisible, confirmLoading, onOk, onCancel } = this.props.store;
    return (
      <Modal
        centered
        className={styles.addProductModal}
        confirmLoading={confirmLoading}
        maskClosable={false}
        okText="保存"
        onCancel={onCancel}
        onOk={onOk}
        open={addProductVisible}
        title="换商品"
        width={888}
      >
        <div className={styles.addProductModalBox}>
          <OriginProduct store={this.props.store}/>
        </div>
      </Modal>
    );
  }
}

// 原始商品表格
@observer
class OriginProduct extends Component< { store?: Store; }> {
  render() {
    const { queryRef, queryProductList, productGrid } = this.props.store;
    return (
      <div className={styles.originProduct}>
        <Form ref={queryRef}>
          <Row>
            <Col span={4}>
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
            <Col span={9}>
              <Item
                name="value"
              >
                <Input onPressEnter={queryProductList}/>
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
            <Col
              className={styles.skuType}
              offset={5}
              span={4}
            >
              <Item
                name="skuType"
                valuePropName="checked"
              >
                <Checkbox onChange={queryProductList}>
                  组合商品
                </Checkbox>
              </Item>
            </Col>
          </Row>
        </Form>
        <div style={{ flex: 1 }}>
          <EgGrid store={productGrid}/>
        </div>
      </div>
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
