import { Radio, Form, Input, Modal, Row, Col } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';
import type Store from './model';

export default observer((props: { store: Store; }) => {
  const {
    visible,
    onBulkExchangeClick,
    formRef,
    onOk,
    confirmLoading,
    selectNum,
  } = props.store;

  const [form] = Form.useForm();
  const replaceType = Form.useWatch('replaceType', form);

  const tips = replaceType === 'noSku' ? '订单中的商品全部替换为' : '替换为';

  return (
    <Modal
      centered
      confirmLoading={confirmLoading}
      forceRender
      onCancel={onBulkExchangeClick}
      onOk={onOk}
      open={visible}
      title="批量换商品"
    >
      <Form
        form={form}
        labelCol={{ span: 5 }}
        ref={formRef}
        wrapperCol={{ span: 10 }}
      >
        <Form.Item
          initialValue="selected"
          name="changeType"
          noStyle
        >
          <Radio.Group className={styles.bottomSpacing}>
            <Radio value="selected">
              选中的订单（
              <span style={{ color: 'red' }}>
                {selectNum}
              </span>
              ）
            </Radio>
            <Radio value="match_condition">
              符合当前查询条件的订单（仅限未审核状态）
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          initialValue="skuNo"
          name="replaceType"
          noStyle
        >
          <Radio.Group className={styles.bottomSpacing}>
            <Radio value="skuNo">
              按系统SKU编码替换
            </Radio>
            <Radio value="skuId">
              按平台SKUID替换
            </Radio>
            <Radio value="noSku">
              忽略原商品全部替换
            </Radio>
          </Radio.Group>
        </Form.Item>
        <div style={{ display: replaceType === 'noSku' ? 'none' : 'block' }}>
          <Form.Item
            className={styles.formNoStyle}
            label="原SKU编码"
            name="oldSkuNo"
            rules={[
              {
                required: replaceType === 'skuNo',
                message: '请输入原SKU编码',
              },
            ]}
            style={{ display: replaceType === 'skuNo' ? 'block' : 'none' }}
          >
            <Input
              placeholder="请输入原SKU编码"
            />
          </Form.Item>
          <Form.Item
            className={styles.formNoStyle}
            label="平台SKUID"
            name="platformSkuId"
            rules={[
              {
                required: replaceType === 'skuId',
                message: '请输入订单明细平台SKUID',
              },
            ]}
            style={{ display: replaceType === 'skuId' ? 'block' : 'none' }}
          >
            <Input
              placeholder="请输入订单明细平台SKUID"
            />
          </Form.Item>
        </div>
        <Row>
          <Col
            className={styles.replace}
            offset={5}
            span={10}
          >
            {tips}
          </Col>
        </Row>
        <Form.Item
          className={styles.formNoStyle}
          label="新SKU编码"
          name="newSkuNo"
          rules={[
            {
              required: true,
              message: '请输入新SKU编码',
            },
          ]}
        >
          <Input
            placeholder="请输入新SKU编码"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});
