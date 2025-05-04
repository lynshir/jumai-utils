import { Typography, Form, Row, Col, Input, Space, Button, Tag, Popover } from 'antd';
import { observer } from 'mobx-react';
import { nanoid } from 'nanoid';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { MarkIcon, MarkImg, MarkSymbol } from '../../../../base/marklist';
import SetMemoModal from '../../../modal/setMemo/setMemoModal';
import Collapse from '../collapse/index';
import CopyComponents from '../copy/index';
import styles from './index.less';
import type store from './model';

const { Text } = Typography;
const { Item } = Form;
interface Interface {
  store: store;
  isSuspended: boolean;
  isInvalidated: boolean;
}
interface DetailStateInterface {
  value?: string;
  state: number;
}
interface TagInterface {
  value?: { tradeMemo: string;tagList: any[]; };
  store: store;
}

class DetailState extends Component<DetailStateInterface> {
  render() {
    const { state } = this.props;
    return (
      <div className={`${styles.state}`}>
        <Text className={`${styles.orderState} ${state === 1 ? styles.redColor : styles.grayColor}`}>
          {state === 1 ? '已挂起' : '已作废'}
        </Text>
        {state === 2 && (
          <Text className={styles.time}>
            {this.props.value}
          </Text>
        )}
        {state === 1 && (
          <Input
            disabled
            value={this.props.value}
          />
        )}
      </div>
    );
  }
}

class Tags extends Component<TagInterface> {
  render() {
    const { tradeMemo, tagList } = this.props.value;
    return (
      <Space>
        {
          tagList && tagList.map((item) => {
            return (
              <span key={nanoid()}>
                <MarkSymbol
                  color={item.color}
                  text={item.text}
                />
              </span>
            );
          })
        }
        {
          tradeMemo && tradeMemo.split(',')
            .map((item) => {
              let content = (
                <div>
                  <p>
                    收件人地址及电话均为集运仓地址及联系电话，若您需要查看消费者信息，请您前往拼多多商家后台进行查看。集运流程请查看相关教程；
                  </p>
                  <p>
                    新疆集运教程：
                    <a
                      href="https://mms.pinduoduo.com/daxue/detail?courseId=5435"
                      rel="noreferrer"
                      target="_blank"
                    >
                      https://mms.pinduoduo.com/daxue/detail?courseId=5435
                    </a>
                  </p>
                  <p>
                    香港集运教程：
                    <a
                      href="https://mms.pinduoduo.com/daxue/detail?courseId=5460"
                      rel="noreferrer"
                      target="_blank"
                    >
                      https://mms.pinduoduo.com/daxue/detail?courseId=5460
                    </a>
                  </p>
                </div>
              );
              if (item === '集运订单' || item === '暂停发货') {
                if (item === '暂停发货') {
                  content = (
                    <div>
                      该订单因发货地疫情影响，暂不支持发货，当疫情限制解除时，订单将重启承诺发货时间倒计时并支持发货
                    </div>
                  );
                }
                return (
                  <Popover
                    content={content}
                    key={nanoid()}
                  >
                    <span
                      style={{
                        fontWeight: 400,
                        color: '#1978ff',
                        lineHeight: '20px',
                        backgroundColor: 'rgba(25, 120, 255, 0.1)',
                        borderRadius: '4px',
                        padding: '2px',
                        marginRight: '4px',
                      }}
                    >
                      {item}
                    </span>
                  </Popover>
                );
              }
              return (
                <span
                  key={nanoid()}
                  style={{
                    fontWeight: 400,
                    color: '#1978ff',
                    lineHeight: '20px',
                    backgroundColor: 'rgba(25, 120, 255, 0.1)',
                    borderRadius: '4px',
                    padding: '2px',
                    marginRight: '4px',
                  }}
                >
                  {item}
                </span>
              );
            })
        }
        <Button
          className={!this.props.store?.parent?.isChecked && 'custom'}
          disabled={this.props.store.parent.isChecked}
          onClick={this?.props?.store?.onSetMemoClick}
        >
          设置标记
        </Button>
      </Space>
    );
  }
}

@observer
export default class extends Component<Interface> {
  render() {
    const { formRef } = this.props.store;
    const { isSuspended, isInvalidated } = this.props;
    return (
      <div className={styles.orderWrapper}>
        <Form
          labelCol={{ span: 5 }}
          ref={formRef}
          wrapperCol={{ span: 19 }}
        >
          <SetMemoModal store={this.props.store.setMemoStore}/>
          <Collapse title="订单信息">
            <Row>
              <Col span={24}>
                <Item
                  initialValue={{
                    tradeMemo: '',
                    tagList: [],
                  }}
                  label="标记"
                  labelCol={{ span: 2 }}
                  name="tags"
                  wrapperCol={{ span: 22 }}
                >
                  <Tags store={this.props.store}/>
                </Item>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <Item
                  label="订单编号"
                  name="saleOrderNo"
                >
                  <Input disabled/>
                </Item>
              </Col>
              <Col span={6}>
                <Item
                  label="平台订单"
                  name="platformOrderCode"
                >
                  <CopyComponents/>
                </Item>
              </Col>
              <Col span={6}>
                <Item
                  label="店铺"
                  name="shopName"
                >
                  <Input disabled/>
                </Item>
              </Col>
              <Col span={6}>
                <Item
                  label="买家昵称"
                  name="buyerNick"
                >
                  <CopyComponents/>
                </Item>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <Item
                  label="平台状态"
                  name="platformOrderStatus"
                >
                  <Input disabled/>
                </Item>
              </Col>
              <Col span={6}>
                <Item
                  label="订单来源"
                  name="originTypeDesc"
                >
                  <Input disabled/>
                </Item>
              </Col>
              <Col span={6}>
                <Item
                  label="支付方式"
                  name="payTypeDesc"
                >
                  <Input disabled/>
                </Item>
              </Col>
              <Col span={6}>
                <Item
                  label="设备来源"
                  name="username8"
                >
                  <Input disabled/>
                </Item>
              </Col>
            </Row>
            <Row>
              {isSuspended && (
                <Col span={6}>
                  <Item
                    label="挂起状态"
                    name="suspendNote"
                  >
                    <DetailState state={1}/>
                  </Item>
                </Col>
              )}
              {isInvalidated && (
                <Col span={6}>
                  <Item
                    label="作废"
                    name="invalidTime"
                  >
                    <DetailState state={2}/>
                  </Item>
                </Col>
              )}
            </Row>
          </Collapse>
        </Form>
      </div>
    );
  }
}
