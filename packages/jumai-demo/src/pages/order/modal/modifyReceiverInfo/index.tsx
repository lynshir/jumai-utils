import { EyeOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Select, Spin, Space } from 'antd';
import { observer } from 'mobx-react';
import type { ReactNode } from 'react';
import React, { Component } from 'react';
import { BalloonTooltips } from '../../../../utils/decryption';
import { VirtualTelPopover } from '../../../../utils/virtualTelPopover/index';
import styles from './index.less';
import type Store from './store';

const { Item } = Form;
const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@observer
export default class extends Component<{ store: Store ; }> {
  private ModifyFooter(): ReactNode {
    const { closeModal, submitModifyInfo, loading } = this.props.store;
    return (
      <div>
        <Button onClick={closeModal}>
          取消
        </Button>
        <Button
          loading={loading}
          onClick={submitModifyInfo}
          type="primary"
        >
          确定
        </Button>
      </div>
    );
  }

  private Operation(): ReactNode {
    const { onCopy, modifyButtonDisabled, changeModalStatus } = this.props.store;
    return (
      <div className={styles.operationWrapper}>
        <Button onClick={onCopy}>
          复制
        </Button>
        <Button
          className={styles.custom}
          disabled={modifyButtonDisabled}
          onClick={changeModalStatus}
        >
          修改收货信息
        </Button>
      </div>
    );
  }

  public getProvinces = (receiverState: number, receiverCity?: number, receiverDistrict?: number) => {
    const params = {
      receiverState: '',
      receiverCity: '',
      receiverDistrict: '',
    };
    const {
      provinceList,
      cityList,
      districtList,
    } = this.props.store;
    try {
      if (receiverState) {
        params.receiverState = provinceList.filter((item) => item.value === receiverState)[0].label;
      }
      if (receiverCity) {
        params.receiverCity = cityList.filter((item) => item.value === receiverCity)[0].label;
      }
      if (receiverDistrict) {
        params.receiverDistrict = districtList.filter((item) => item.value === receiverDistrict)[0].label;
      }
    } catch (e) {
      console.error(e);
      return params;
    }
    return params;
  };

  render(): ReactNode {
    const { params, isTaobaoVirtualTel, virtualTel, virtualNo, formRef, showSpin, provinceList, cityList, districtList, formItemOnChange, visible, closeModal, analysisAddress, getPlaintextClick, disabled, modifyFlag } = this.props.store;
    let fields: any = formRef?.current?.getFieldsValue() || {};
    if (formRef.current && fields.receiverAddress) {
      const { receiverState, receiverCity, receiverDistrict } = fields;
      const addressParams = this.getProvinces(receiverState, receiverCity, receiverDistrict);
      fields = {
        ...fields,
        ...addressParams,
      };
    }
    return (
      <Modal
        footer={modifyFlag ? this.ModifyFooter() : this.Operation()}
        forceRender
        maskClosable={false}
        onCancel={closeModal}
        open={visible}
        title={modifyFlag ? '收货信息' : '修改收货信息'}
        width={628}
      >
        <Spin spinning={showSpin}>
          <div style={{ display: 'flex' }}>
            <Form
              {...formLayout}
              colon={false}
              ref={formRef}
              style={{ width: '568px' }}
            >
              <Row>
                <Col span={12}>
                  <Item
                    className={styles.receiverName}
                    label="收货人"
                    labelCol={{ span: 6 }}
                    name="receiverNameBlur"
                    rules={[{ required: true }]}
                    wrapperCol={{ span: 16 }}
                  >
                    <Input disabled={disabled}/>
                  </Item>
                </Col>
                <Col
                  span={12}
                >
                  <Item
                    label="手机/固话"
                    name="receiverMobileBlur"
                    rules={[{ required: true }]}

                  >
                    <Input disabled={disabled}/>
                  </Item>
                </Col>
                <Col span={24}>
                  <Item
                    label="收货地址"
                    labelCol={{ span: 3 }}
                    required
                    style={{ marginBottom: 0 }}
                    wrapperCol={{ span: 20 }}
                  >
                    <Space>
                      <Item
                        name="receiverState"
                        rules={[
                          {
                            required: true,
                            message: '请输入省',
                          },
                        ]}
                        style={{ width: 130 }}
                      >
                        <Select
                          disabled={disabled}
                          onChange={(val) => {
                            formItemOnChange('receiverState', val);
                          }}
                          options={provinceList}
                          placeholder="省"
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
                        style={{ width: 130 }}
                      >
                        <Select
                          disabled={disabled}
                          onChange={(val) => {
                            formItemOnChange('receiverCity', val);
                          }}
                          options={cityList}
                          placeholder="市"
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
                        style={{ width: 100 }}

                      >
                        <Select
                          disabled={disabled}
                          onChange={(val) => {
                            formItemOnChange('receiverDistrict', val);
                          }}
                          options={districtList}
                          placeholder="区"
                        />
                      </Item>
                      <Item
                        name="receiverTown"
                        rules={[
                          {
                            required: true,
                            message: '请输入镇',
                          },
                        ]}
                      >
                        <Input
                          disabled={disabled}
                          placeholder="镇"
                        />
                      </Item>
                    </Space>
                  </Item>
                </Col>
                <Col span={24}>
                  <Item
                    label=" "
                    labelCol={{ span: 3 }}
                    name="receiverAddress"
                    style={{ marginBottom: 0 }}
                    wrapperCol={{ span: 20 }}
                  >
                    <TextArea
                      disabled={disabled}
                      placeholder="点击右侧按钮可进行地址解析,请按照规范填写（或粘贴）。例如：张三，138000000000，XXX省XXX市XXX区XXXXXXX"
                    />
                  </Item>
                </Col>
              </Row>
            </Form>
            <div style={{
              marginLeft: '-16px',
              position: 'relative',
            }}
            >
              <EyeOutlined
                className={styles.iconStyle}
                onClick={() => getPlaintextClick('receiverName')}
                style={{
                  position: 'absolute',
                  left: '-294px',
                  display: `${modifyFlag ? 'none' : 'block'}`,
                }}
              />
              {virtualTel ? (
                <BalloonTooltips
                  receiverAddress={fields?.receiverAddress || ''}
                  receiverCity={fields?.receiverCity}
                  receiverDistrict={fields?.receiverDistrict}
                  receiverMobile={fields?.receiverMobileBlur}
                  receiverName={fields?.receiverNameBlur}
                  receiverState={fields?.receiverState}
                  virtualNo={virtualNo}
                >
                  <EyeOutlined
                    className={styles.iconStyle}
                    onClick={() => getPlaintextClick('receiverMobile')}
                    style={{ display: `${modifyFlag ? 'none' : 'block'}` }}
                  />
                </BalloonTooltips>
              ) : params.platformType === 1 && isTaobaoVirtualTel ? (!modifyFlag && (
                <div className={styles.virtualTelWrapper}>
                  <VirtualTelPopover/>
                </div>
              )
              ) : (
                <EyeOutlined
                  className={styles.iconStyle}
                  onClick={() => getPlaintextClick('receiverMobile')}
                  style={{ display: `${modifyFlag ? 'none' : 'block'}` }}
                />
              )}
              {
                modifyFlag ? (
                  <i
                    className={`icon-submit ${styles.iconStyle} ${styles.bottomIcon}`}
                    onClick={analysisAddress}
                    style={{ display: `${modifyFlag ? 'block' : 'none'}` }}
                  />
                ) : (
                  <EyeOutlined
                    className={`${styles.iconStyle} ${styles.bottomIcon}`}
                    onClick={() => getPlaintextClick('receiverAddress')}
                    style={{ display: `${modifyFlag ? 'none' : 'block'}` }}
                  />
                )
              }
            </div>
          </div>
        </Spin>
      </Modal>
    );
  }
}
