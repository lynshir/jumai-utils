import { EyeOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Space, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import type { ReactNode } from 'react';
import React, { Component } from 'react';
import { BalloonTooltips } from '../../../../../utils/decryption/index';
import { VirtualTelPopover } from '../../../../../utils/virtualTelPopover/index';
import Collapse from '../collapse/index';
import styles from './index.less';
import type store from './model';

const { Item } = Form;
interface Interface {
  store: store;
}
interface ReceiverAddressInterfaceValue {
  receiverAddressBlur?: string;
  receiverCity?: string;
  receiverState?: string;
  receiverDistrict?: string;
  receiverTown?: string;
}
interface ReceiverAddressInterface extends Interface{
  value?: ReceiverAddressInterfaceValue;
  onChange?: (value: ReceiverAddressInterfaceValue) => void;
}
@observer
class ReceiverAddress extends Component<ReceiverAddressInterface> {
  render() {
    const { parent: { isChecked }} = this.props.store;
    const { receiverAddressBlur, receiverCity, receiverState, receiverDistrict, receiverTown } = this.props.value;
    const onChange = (obj) => {
      this.props.onChange({
        receiverAddressBlur,
        receiverCity,
        receiverState,
        receiverDistrict,
        receiverTown,
        ...obj,
      });
    };
    return (
      <div className={styles.receiver}>
        <Input
          className={styles.space}
          disabled
          onChange={(e) => {
            onChange({ receiverState: e.target.value });
          }}
          placeholder="省"
          style={{ width: 113 }}
          value={receiverState}
        />
        <Input
          className={styles.space}
          disabled
          onChange={(e) => {
            onChange({ receiverCity: e.target.value });
          }}
          placeholder="市"
          style={{ width: 113 }}
          value={receiverCity}
        />
        <Input
          className={styles.space}
          disabled
          onChange={(e) => {
            onChange({ receiverDistrict: e.target.value });
          }}
          placeholder="区"
          style={{ width: 113 }}

          value={receiverDistrict}
        />
        <Input
          className={styles.space}
          disabled
          onChange={(e) => {
            onChange({ receiverTown: e.target.value });
          }}
          placeholder="镇"
          style={{ width: 113 }}
          value={receiverTown}
        />
        <Input
          className={`${styles.receiverAddress}`}
          disabled
          onChange={(e) => {
            onChange({ receiverAddressBlur: e.target.value });
          }}
          placeholder="请输入详细地址"
          value={receiverAddressBlur}
        />
        <Tooltip title="查看收件人真实信息">
          <EyeOutlined
            className={styles.getPlaintext}
            onClick={() => this.props.store.getPlaintextClick('receiverAddress')}
          />
        </Tooltip>
        {!isChecked ? (
          <Tooltip title="地址解析">
            <span
              className={`${styles.getPlaintext} icon-icon_ddcx`}
              onClick={this.props.store.getParsingAddressClick}
              style={{ fontSize: 20 }}
            />
          </Tooltip>
        ) : ''}

      </div>
    );
  }
}

@observer
class ReceiverPhone extends Component<any, any> {
  render() {
    const {
      parent: { isChecked },
      virtualTel,
      formRef,
      virtualNo,
      platformType,
      isTaobaoVirtualTel,
    } = this.props.store;
    let fields: any = {};
    if (formRef.current) {
      fields = formRef?.current?.getFieldsValue();
      const { receiverCity, receiverState, receiverDistrict } = fields.receiverAddress;
      fields.receiverCity = receiverCity || '';
      fields.receiverState = receiverState || '';
      fields.receiverDistrict = receiverDistrict || '';
    }
    console.log(virtualTel, '=====<>');
    return (
      <div className={styles.receiverPhone}>
        <Input
          disabled
          onChange={(e) => {
            this.props.onChange(e.target.value);
          }}
          style={{ maxWidth: 300 }}
          value={this.props.value}
        />
        {!virtualTel ? platformType === 1 && isTaobaoVirtualTel ? (
          <VirtualTelPopover/>
        ) : (
          <Tooltip title="查看收件人真实信息">
            <EyeOutlined
              className={styles.getPlaintext}
              onClick={() => this.props.store.getPlaintextClick('receiverMobile')}
            />
          </Tooltip>
        ) : (
          <BalloonTooltips
            receiverAddress={fields?.receiverAddress?.receiverAddressBlur || ''}
            receiverCity={fields?.receiverCity}
            receiverDistrict={fields?.receiverDistrict}
            receiverMobile={fields?.receiverMobileBlur}
            receiverName={fields?.receiverNameBlur}
            receiverState={fields?.receiverState}
            virtualNo={virtualNo}
          >
            <EyeOutlined
              className={styles.getPlaintext}
              onClick={() => this.props.store.getPlaintextClick('receiverMobile')}
            />
          </BalloonTooltips>
        )}
      </div>
    );
  }
}

class ReceiverName extends Component<any, any> {
  render() {
    return (
      <div className={styles.receiverPhone}>
        <Input
          disabled
          value={this.props.value}
        />
        <Tooltip title="查看收件人真实信息">
          <EyeOutlined
            className={styles.getPlaintext}
            onClick={() => this.props.store.getPlaintextClick('receiverName')}
          />
        </Tooltip>
      </div>
    );
  }
}
@observer
export default class extends Component<Interface> {
  public titleBUtton = (): ReactNode => {
    const { parent: { isChecked }} = this.props.store;
    return (
      <Space>
        <Button
          className={!isChecked && 'custom'}
          disabled={isChecked}
          onClick={(e) => {
            e.stopPropagation();
            this.props.store.openModifyModal();
          }}
        >
          修改收货信息
        </Button>
        <Button
          className="custom"
          onClick={(e) => {
            e.stopPropagation();
            this.props.store.onCopy();
          }}
        >
          复制
        </Button>
      </Space>
    );
  };

  render() {
    const { formRef, parent: { isChecked }} = this.props.store;
    return (
      <Form
        labelCol={{ span: 5 }}
        ref={formRef}
        wrapperCol={{ span: 19 }}
      >
        <Collapse
          title="收货信息"
          titleButton={this.titleBUtton()}
        >
          <Row>
            <Col span={6}>
              <Item
                label="收货人"
                name="receiverNameBlur"
              >
                <ReceiverName store={this.props.store}/>
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="手机/固话"
                name="receiverMobileBlur"
              >

                <ReceiverPhone store={this.props.store}/>
              </Item>
            </Col>
            <Col span={12}>
              <Item
                initialValue={
                  {
                    receiverAddressBlur: '',
                    receiverCity: '',
                    receiverState: '',
                    receiverDistrict: '',
                    receiverTown: '',
                  }
                }
                label="收货地址"
                labelCol={{ span: 2 }}
                name="receiverAddress"
                style={{ marginLeft: 21 }}
                wrapperCol={{ span: 22 }}
              >
                <ReceiverAddress store={this.props.store}/>
              </Item>
            </Col>
          </Row>
        </Collapse>
      </Form>
    );
  }
}
