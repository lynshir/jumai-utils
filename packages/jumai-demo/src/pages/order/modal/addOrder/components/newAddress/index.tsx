import { Button, Cascader, Checkbox, Col, Form, Input, Modal, Row, Spin } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';
import type { AddressModalStore } from './store';
import { toJS } from 'mobx';

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const titleMap = {
  add: '新增',
  edit: '编辑',
};

export const AddressModal: React.FC<{ store: AddressModalStore; }> = observer((props) => {
  const {
    visible,
    loading,
    setRef,
    loadData,
    addressOptions,
    onParserAddressChange,
    address,
    parsingAddress,
    type,
    onCancel,
    onOk,
    confirmLoading,
    parent,
  } = props.store;
  return (
    <Modal
      className={styles.modal}
      confirmLoading={confirmLoading}
      maskClosable={false}
      onCancel={onCancel}
      onOk={onOk}
      open={visible}
      title={`${titleMap[type]}${parent.activeKey === '1' ? '发件地址' : '收件地址'}`}
      width={577}
    >
      <Spin spinning={loading}>
        <Form
          ref={setRef}
          {...formLayout}
        >
          <Form.Item
            label={parent.activeKey === '1' ? '发货人' : '收货人'}
            name="receiverName"
            required
            rules={[
              {
                required: true,
                whitespace: true,
                message: '请输入收货人',
              },
            ]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label="手机号"
            name="receiverMobile"
            required
            rules={[
              {
                required: true,
                whitespace: true,
                message: '请输入手机号',
              },
              {
                pattern: /^1\d{10}/,
                message: '手机号格式不正确',
              },
            ]}
          >
            <Input maxLength={11}/>
          </Form.Item>
          <Form.Item
            label="所在地区"
            name="address"
            required
            rules={[
              {
                required: true,
                message: '请选择所在地区',
              },
            ]}
          >
            <Cascader
              loadData={loadData}
              options={toJS(addressOptions)}
            />
          </Form.Item>
          <Form.Item
            label="详细地址"
            name="receiverAddress"
            required
            rules={[
              {
                required: true,
                whitespace: true,
                message: '请输入详细地址',
              },
            ]}
          >
            <Input.TextArea style={{
              height: '56px',
              resize: 'none',
            }}
            />
          </Form.Item>
        </Form>
        <Row>
          <Col span={4}>
            <header className={styles.parsingHeader}>
              智能解析：
            </header>
          </Col>
          <Col span={20}>
            <div>
              <Input.TextArea
                onChange={onParserAddressChange}
                onPressEnter={onParserAddressChange}
                placeholder="粘贴或输入文本可快速识别地址信息，如：李四13712348765 浙江省杭州市西湖区文一西路88号"
                style={{
                  height: '89px',
                  resize: 'none',
                }}
                value={address}
              />
            </div>
          </Col>
        </Row>

        <div className={styles.parsingBtn}>
          <Button
            ghost
            onClick={parsingAddress}
            type="primary"
          >
            一键解析
          </Button>
        </div>

      </Spin>
    </Modal>
  );
});
