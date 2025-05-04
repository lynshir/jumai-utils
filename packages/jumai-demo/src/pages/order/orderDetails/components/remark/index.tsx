
import { Button, Form, Row, Col, Input, Radio } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import Collapse from '../collapse/index';
import styles from './index.less';
import type store from './model';

const { Item } = Form;
interface Interface {
  store: store;
}
interface OrderRemarkInterface extends Interface{
  value?: string;
  onChange?: (value: string) => void;
}
interface CustomerServiceRemarkBaseInterface {
  sellerFlag: number;
  remark: string;
}
interface CustomerServiceRemarkInterface extends Interface{
  value?: CustomerServiceRemarkBaseInterface;
  onChange?: (value: CustomerServiceRemarkBaseInterface) => void;
}
@observer
class OrderRemark extends Component<OrderRemarkInterface> {
  render() {
    const { value, onChange } = this.props;
    return (
      <div className={styles.orderRemark}>
        <Input
          disabled={this.props.store.parent.isChecked}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          value={value}
        />
        <Button
          className={`${this.props.store.parent.isChecked ? '' : 'custom'} ${styles.orderRemarkSave}`}
          disabled={this.props.store.parent.isChecked}
          onClick={() => {
            this.props.store.onSave({ systemMemo: value });
          }}
        >
          保存
        </Button>
      </div>
    );
  }
}

@observer
class CustomerServiceRemark extends Component<CustomerServiceRemarkInterface> {
  public flagGroup = [
    {
      id: 0,
      color: '',
    },
    {
      id: 1,
      color: '#F2270A',
    },
    {
      id: 2,
      color: '#FAE000',
    },
    {
      id: 3,
      color: '#02C190',
    },
    {
      id: 4,
      color: '#1978FF',
    },
    {
      id: 5,
      color: '#F516F8',
    },
  ];

  render() {
    const { value, onChange } = this.props;
    return (
      <Row className={styles.orderRemark}>
        <Col span={5}>
          <Radio.Group
            onChange={(e) => {
              this.props.onChange({
                ...value,
                sellerFlag: e.target.value,
              });
            }}
            value={value?.sellerFlag}
          >
            {this.flagGroup.map((_item) => (
              <Radio
                disabled={this.props.store.parent.isChecked}
                key={_item.id}
                value={_item.id}
              >
                {_item.color ? (
                  <span
                    className="icon-flag"
                    style={{
                      color: _item.color,
                      fontSize: 16,
                    }}
                  />
                ) : '无旗帜'}
              </Radio>
            ))}
          </Radio.Group>
        </Col>
        <Col span={12}>
          <Input
            disabled={this.props.store.parent.isChecked}

            onChange={(e) => {
              this.props.onChange({
                ...value,
                remark: e.target.value,
              });
            }}
            style={{ marginLeft: -10 }}
            value={value?.remark}
          />
        </Col>
        <Col span={3}>
          <Button
            className={`${this.props.store.parent.isChecked ? '' : 'custom'} ${styles.orderRemarkSave}`}
            disabled={this.props.store.parent.isChecked}
            onClick={() => {
              this.props.store.onSaveFlag({
                sellerMemo: value.remark,
                sellerFlag: value.sellerFlag,
              });
            }}
          >
            保存
          </Button>
        </Col>
      </Row>
    );
  }
}

@observer
export default class extends Component<Interface> {
  render() {
    const { formRef } = this.props.store;
    return (
      <Form
        labelCol={{ span: 2 }}
        ref={formRef}
        wrapperCol={{ span: 22 }}
      >
        <Collapse title="备注留言">
          <Row>
            <Col
              span={12}
            >
              <Item
                className={styles.item}
                label="买家留言"
                name="buyerMessage"
              >
                <Input disabled/>
              </Item>
            </Col>
            <Col
              span={12}
            >
              <Item
                className={styles.item}
                label="订单备注"
                name="systemMemo"
              >
                <OrderRemark store={this.props.store}/>
              </Item>
            </Col>
          </Row>
          <Row>
            <Col
              span={24}
            >
              <Item
                className={styles.item}
                label="客服备注"
                labelCol={{ span: 1 }}
                name="sellerMemo"
                wrapperCol={{ span: 23 }}
              >
                <CustomerServiceRemark store={this.props.store}/>
              </Item>
            </Col>
          </Row>
        </Collapse>
      </Form>
    );
  }
}
