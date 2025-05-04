import { Button, Form, Input, Row, Col, Select, Typography, InputNumber, Tooltip, Space } from 'antd';
import { EgGrid, FullModal } from 'jumai-utils';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './addOrderStore';
import { baseInfo, senderInfo } from './constant';
import styles from './index.less';
import Title from './title';
import { AddressModal } from './components/newAddress';
import AddressBaseManagement from './components/addressBaseManagement';

const { Item } = Form;
const { Option } = Select;
const { Text } = Typography;

const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@observer
export default class AddOrderModal extends Component<{ store?: Store ; }> {
  private Operation(): ReactNode {
    const { handleCloseOrderModal, handleSubmit, submitLoading } = this.props.store;
    return (
      <div className={styles.operationWrapper}>
        <Button onClick={handleCloseOrderModal}>
          取消
        </Button>
        <Button
          htmlType="submit"
          loading={submitLoading}
          onClick={handleSubmit}
          type="primary"
        >
          提交
        </Button>
      </div>
    );
  }

  private baseInfo = (): ReactNode => {
    return (
      <div>
        <Title text="基本信息"/>
        <Row className={styles.pd24}>
          {
            baseInfo(this.props.store).map((item) => (
              <Col
                key={item.name}
                span={6}
              >
                <Item
                  hidden={item.hidden}
                  label={item.label}
                  name={item.name}
                  rules={[{ required: item.required }]}
                >
                  {
                    item.type === 'select' ? (
                      <Select
                        onChange={item.handleChange}
                        optionFilterProp="label"
                        options={item.options || []}
                        showSearch
                      />
                    ) : <Input/>
                  }
                </Item>
              </Col>
            ))
          }
        </Row>
      </div>
    );
  };

  private buyerInfo = (): ReactNode => {
    const { analysisAddress, setActiveKey, provinceList, cityList, districtList, formItemOnChange } = this.props.store;
    return (
      <>
        <Title text="买家信息"/>
        <Row
          className={styles.pd24}
          style={{ paddingBottom: '0px' }}
        >
          <Col
            span={6}
            style={{ position: 'relative' }}
          >
            <Item
              label="收货人"
              name="receiverName"
              rules={[{ required: true }]}
            >
              <Input/>
            </Item>
            <Space className={styles.operate}>
              <a onClick={(e) => {
                setActiveKey('2', 2);
              }}
              >
                选择
              </a>
              <a onClick={(e) => {
                setActiveKey('2', 1);
              }}
              >
                新增
              </a>
            </Space>
          </Col>
          <Col span={6}>
            <Item
              label="手机/固话"
              name="receiverMobile"
              rules={[{ required: true }]}
            >
              <Input/>
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="收货地址"
              required
              style={{ marginBottom: 0 }}
            >
              <div className={styles.scdWrapper}>
                <Item
                  name="receiverState"
                  rules={[
                    {
                      required: true,
                      message: '请输入省',
                    },
                  ]}
                  style={{ width: '30%' }}
                >
                  <Select
                    onChange={(val) => {
                      formItemOnChange('select', 'receiverState', val);
                    }}
                    options={provinceList}
                  />
                </Item>
                <Item
                  name="receiverCity"
                  rules={[
                    {
                      required: true,
                      message: '请输入市',
                    },
                  ]}
                  style={{ width: '30%' }}
                >
                  <Select
                    onChange={(val) => {
                      formItemOnChange('select', 'receiverCity', val);
                    }}
                    options={cityList}
                  />
                </Item>
                <Item
                  name="receiverDistrict"
                  rules={[
                    {
                      required: true,
                      message: '请输入区',
                    },
                  ]}
                  style={{ width: '30%' }}

                >
                  <Select
                    options={districtList}
                  />
                </Item>
              </div>
            </Item>
          </Col>
          <Col span={6}>
            <Item label="详细地址">
              <div className={styles.addressWrapper}>
                <Item
                  name="receiverAddress"
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: '请输入地址',
                    },
                  ]}
                >
                  <Input/>
                </Item>
                <Tooltip
                  placement="bottom"
                  title="点击解析地址"
                >
                  <i
                    className="icon-submit"
                    onClick={analysisAddress}
                    style={{
                      fontSize: '26px',
                      color: '#1978ff',
                      cursor: 'pointer',
                      marginLeft: '4px',
                    }}
                  />
                </Tooltip>
              </div>
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="买家留言"
              name="buyerMessage"
            >
              <Input/>
            </Item>

          </Col>
          <Col span={6}>
            <Item
              label="买家昵称"
              name="buyerNick"
            >
              <Input/>
            </Item>
          </Col>
        </Row>
      </>
    );
  };

  private senderInfo = (): ReactNode => {
    const { senderAddress, provinceList, setActiveKey, citySenderList, districtSenderList, formItemOnChange } = this.props.store;

    return (
      <>
        <Title text="发件人信息"/>
        <Row
          className={styles.pd24}
          style={{ paddingBottom: '0px' }}
        >
          {
            senderInfo(this.props.store).map((item) => (
              <Col
                key={item.name}
                span={6}
                style={item.name === 'senderName' ? { position: 'relative' } : undefined}
              >
                <Item
                  label={item.label}
                  name={item.name}
                >
                  <Input/>
                </Item>
                {
                  item.name === 'senderName' ? (
                    <Space
                      className={styles.operate}
                    >
                      <a onClick={(e) => {
                        setActiveKey('1', 2);
                      }}
                      >
                        选择
                      </a>
                      <a onClick={(e) => {
                        setActiveKey('1', 1);
                      }}
                      >
                        新增
                      </a>
                    </Space>
                  ) : undefined
                }
              </Col>
            ))
          }
          <Col span={6}>
            <Item
              label="发货地址"
              style={{ marginBottom: 0 }}
            >
              <div className={styles.scdWrapper}>
                <Item
                  name="senderState"
                  style={{ width: '30%' }}
                >
                  <Select
                    onChange={(val) => {
                      formItemOnChange('select', 'senderState', val);
                    }}
                    options={provinceList}
                  />
                </Item>
                <Item
                  name="senderCity"
                  style={{ width: '30%' }}
                >
                  <Select
                    onChange={(val) => {
                      formItemOnChange('select', 'senderCity', val);
                    }}
                    options={citySenderList}
                  />
                </Item>
                <Item
                  name="senderDistrict"
                  style={{ width: '30%' }}

                >
                  <Select
                    options={districtSenderList}
                  />
                </Item>
              </div>
            </Item>
          </Col>
          <Col span={6}>
            <Item label="详细地址">
              <div className={styles.addressWrapper}>
                <Item
                  name="senderAddress"
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: '请输入地址',
                    },
                  ]}
                >
                  <Input/>
                </Item>
                <Tooltip
                  placement="bottom"
                  title="点击解析地址"
                >
                  <i
                    className="icon-submit"
                    onClick={senderAddress}
                    style={{
                      fontSize: '26px',
                      color: '#1978ff',
                      cursor: 'pointer',
                      marginLeft: '4px',
                    }}
                  />
                </Tooltip>
              </div>
            </Item>
          </Col>

          <Col span={24}>
            <Item
              label="客服备注"
              labelCol={{ span: 2 }}
              name="sellerMemo"
              wrapperCol={{ span: 22 }}
            >
              <Input/>
            </Item>
          </Col>
        </Row>
      </>
    );
  };

  private productInfo = (): ReactNode => {
    const { productGridModel, querySkuRef, queryProductInfo, openAddProductModal, clearProductInfo } = this.props.store;
    return (
      <>
        <Title text="商品信息"/>
        <div className={styles.productButtonWrapper}>
          <Button
            onClick={openAddProductModal}
            type="primary"
          >
            添加商品
          </Button>
          <Button
            onClick={clearProductInfo}
            style={{ margin: '0 8px' }}
          >
            清空
          </Button>
          <Form
            layout="inline"
            ref={querySkuRef}
          >
            <Item
              initialValue="skuNo"
              label="扫描条码"
              name="key"
            >
              <Select
                style={{ width: '80px' }}
              >
                <Option value="skuNo">
                  SKU编码
                </Option>
                <Option value="barCode">
                  条形码
                </Option>
              </Select>
            </Item>
            <Item name="value">
              <Input
                onPressEnter={queryProductInfo}
                style={{ width: '180px' }}
              />
            </Item>
          </Form>
        </div>
        <div style={{
          height: '300px',
          marginBottom: '12px',
        }}
        >
          <EgGrid store={productGridModel}/>
        </div>

      </>
    );
  };

  private totalInfo = (): ReactNode => {
    const { totalInfo, formItemOnChange } = this.props.store;
    return (
      <>
        <Row
          className={styles.summary}
          justify="end"
        >
          <Col
            className={styles.col}
            span={3}
          >
            <div className={styles.mb12}>
              <Text className={styles.span}>
                商品总数量：
              </Text>
              <Text>
                {totalInfo.totalNum}
              </Text>
            </div>
            <div className={styles.mb12}>
              <Text className={styles.span}>
                商品总条数：
              </Text>
              <Text>
                {totalInfo.totalSku}
              </Text>
            </div>
          </Col>
          <Col span={3}>
            <div className={styles.mb12}>
              <Text className={styles.span}>
                商品总金额：
              </Text>
              {' '}
              <Text>
                ¥
                {' '}
                {totalInfo.totalFee?.toFixed(2)}
              </Text>
            </div>
            <div className={styles.postFeeWrapper}>
              <Text className={styles.span}>
                邮费：
              </Text>
              <Item
                initialValue={0}
                name="postFee"
                style={{
                  display: 'inline-block',
                  marginTop: '-6px',
                  marginBottom: '8px',
                }}
              >
                <InputNumber
                  min={0}
                  onChange={(val) => {
                    formItemOnChange('inputNumber', 'postFee', val);
                  }}
                  size="small"
                />
              </Item>
            </div>
            <div className={styles.mb12}>
              <Text className={styles.span}>
                订单总金额：
              </Text>
              {' '}
              <Text>
                ¥
                {' '}
                {totalInfo.orderFee.toFixed(2)}
              </Text>
            </div>

          </Col>
        </Row>
        <Row
          className={styles.summary}
          justify="end"
          style={{
            borderBottom: 'unset',
            paddingBottom: 4,
          }}
        >
          <Col
            className={styles.col}
            span={3}
          >
            <div>
              <Text
                className={`${styles.span}`}
                style={{ marginBottom: 0 }}
              >
                实付总金额：
              </Text>
              <Text style={{
                fontSize: '14px',
                color: '#F2270A',
              }}
              >
                ¥
                {' '}
                {totalInfo.payment.toFixed(2)}
              </Text>
            </div>
          </Col>
        </Row>
      </>
    );
  };

  // private totalInfoQuit = (): ReactNode => {
  //   return (
  //     <>
  //       <Title text="结算信息"/>
  //       <Row className={styles.pd24}>
  //         {
  //           totalInfo(this.props.store).map((item) => (
  //             <Col
  //               key={item.name}
  //               span={6}
  //             >
  //               {
  //                 item.name ? (
  //                   <Item

  //                     label={item.label}
  //                     name={item.name}
  //                   >
  //                     {
  //                       item.type === 'select' ? (
  //                         <Select
  //                           disabled={item.disabled}
  //                           options={item.options || []}
  //                         />
  //                       ) : (
  //                         <Input
  //                           disabled={item.disabled}
  //                           onBlur={item.handleChange}
  //                         />
  //                       )
  //                     }
  //                   </Item>
  //                 ) : null
  //               }
  //             </Col>
  //           ))
  //         }
  //       </Row>
  //     </>
  //   );
  // };

  render(): ReactNode {
    const { showOrderModal, addressModalStore, addressBaseManagementModel, handleCloseOrderModal, amFlag, orderFormRef } = this.props.store;
    return (
      <FullModal
        onCancel={handleCloseOrderModal}
        operation={this.Operation()}
        title={amFlag ? '复制新建' : '新增\拉取订单'}
        visible={showOrderModal}
      >
        <Form
          ref={orderFormRef}
          style={{ padding: '16px' }}
          {...formLayout}
        >
          {this.baseInfo()}
          {this.buyerInfo()}
          {this.senderInfo()}
          {this.productInfo()}
          {this.totalInfo()}
        </Form>
        <AddressModal store={addressModalStore}/>
        <AddressBaseManagement store={addressBaseManagementModel}/>
      </FullModal>
    );
  }
}

