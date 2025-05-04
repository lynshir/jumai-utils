import { WarningFilled, DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import { Modal, Button, Form, Select, Input, Row, Col, Checkbox } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import type { ReactNode } from 'react';
import React, { Component } from 'react';
import type Store from './addProductStore';
import styles from './index.less';

const mb8 = { marginBottom: '8px' };

const { Item } = Form;
@observer
export default class AddProductModal extends Component< { store?: Store; }> {
  render(): ReactNode {
    const { addProductVisible, confirmLoading, batchAdd, batchDelete, handleAddProduct, closeAddProcutModal } = this.props.store;
    return (
      <Modal
        className={styles.addProductModal}
        confirmLoading={confirmLoading}
        maskClosable={false}
        okText="保存"
        onCancel={closeAddProcutModal}
        onOk={handleAddProduct}
        open={addProductVisible}
        title="添加商品"
        width={1100}
        zIndex={1400}
      >
        <div className={styles.addProductModalBox}>
          <OriginProduct store={this.props.store}/>
          <div className={styles.tableBtnContainer}>
            <Button
              className={styles.tableBtn}
              icon={<DoubleRightOutlined/>}
              onClick={batchAdd}
              type="primary"
            >
              添加
            </Button>
            <Button
              className={styles.tableBtn}
              icon={<DoubleLeftOutlined/>}
              onClick={batchDelete}
            >
              移除
            </Button>
          </div>
          <TargetProduct store={this.props.store}/>
        </div>

        {/* <Form ref={queryRef}>
          <Row>
            <Col span={3}>
              <Item
                initialValue="skuNo"
                name="key"
                style={{ ...mb8 }}
              >
                <Select
                  dropdownStyle={{ zIndex: 1401 }}
                  options={selectOptions}
                />
              </Item>
            </Col>
            <Col span={6}>
              <Item
                name="value"
                style={{ ...mb8 }}
              >
                <Input onPressEnter={queryProductList}/>
              </Item>
            </Col>
            <Col span={2}>
              <Item style={{ ...mb8 }}>
                <Button
                  onClick={queryProductList}
                  type="primary"
                >
                  查询
                </Button>
              </Item>
            </Col>
            <Col/>
            <Col span={13}>
              <Item style={{ ...mb8 }}>
                <Button
                  ghost
                  onClick={batchAdd}
                  type="primary"
                >
                  批量添加
                </Button>
              </Item>
            </Col>
          </Row>
        </Form>
        <div style={{ height: '250px' }}>
          <EgGrid store={productGrid}/>
        </div>
        <div style={{ height: '250px' }}>
          <EgGrid store={targetGrid}/>
        </div> */}
      </Modal>
    );
  }
}

// 原始商品表格
@observer
class OriginProduct extends Component< { store?: Store; }> {
  render() {
    const { queryRef, queryProductList, productGrid, batchAdd } = this.props.store;
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
        <div style={{ height: '540px' }}>
          <EgGrid store={productGrid}/>
        </div>
      </div>
    );
  }
}

// 目标商品表格
@observer
class TargetProduct extends Component <{ store?: Store; }> {
  render() {
    const { targetGrid } = this.props.store;
    return (
      <div className={styles.targetProduct}>
        <p className={styles.label}>
          <span className={styles.labelLine}/>
          <span>
            已选商品
          </span>
        </p>
        <div style={{ height: '540px' }}>
          <EgGrid store={targetGrid}/>
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
