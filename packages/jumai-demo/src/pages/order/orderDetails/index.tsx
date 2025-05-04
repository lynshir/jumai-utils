import { Button, Space, Divider, Spin } from 'antd';
import { FullModal, Permission } from 'jumai-utils';
import { observer } from 'mobx-react';
import { nanoid } from 'nanoid';
import React, { Component, Fragment } from 'react';
import type { ReactNode } from 'react';
import OperationTime from '../../base/operationTime';
import OrderSteps from '../../base/orderSteps/index';
import SkuBreakUpModal from '../../base/skuBreakUp';
import CommodityInformation from './components/commodityInformation';
import DeliveryInformation from './components/deliveryInformation';
import OrderInformation from './components/orderInformation';
import ReceivingInformation from './components/receivingInformation';
import Remark from './components/remark';
import styles from './index.less';
import type { ParentPropsInterface } from './interfaces/orderDetailsInterface';

@observer
export default class extends Component<ParentPropsInterface> {
  constructor(props) {
    super(props);
  }

  private renderFullModalOperation = () => {
    const { buttonGroup } = this.props.store;
    return (
      <div className={styles.operationWrapper}>
        <Space>
          {buttonGroup.map((_item) => {
            if (_item.getDisabled()) {
              return undefined;
            }
            return (
              <Permission permissionId={`505_${_item.permissionId}`}>
                <Button
                  className={styles.buttonGroup}
                  key={nanoid()}
                  onClick={_item.onClick}
                >
                  {_item.name}
                </Button>
              </Permission>
            );
          })}
        </Space>
        {/* <Divider
          className={styles.divider}
          type="vertical"
        />
        <Space>
          <Button>
            上一单
          </Button>
          <Button type="primary">
            下一单
          </Button>
        </Space>*/}
      </div>
    );
  };

  render() {
    const { skuBreakUpModel, spinning, visible, isSuspended, isInvalidated, stateTime, onCancel, orderInformationModel, remarkModel, commodityInformation, deliveryInformationModel, receivingInformation, operationTimeModel } = this.props.store;
    return (
      <FullModal
        onCancel={onCancel}
        operation={this.renderFullModalOperation()}
        title="订单详情"
        titleClassName={styles.modalTitle}
        visible={visible}
      >
        <Spin
          size="large"
          spinning={spinning}
          tip="数据加载中..."
        >
          {visible ? (
            <div
              className={styles.children}
            >
              <OrderSteps selectedData={stateTime}/>
              <OrderInformation
                isInvalidated={isInvalidated}
                isSuspended={isSuspended}
                store={orderInformationModel}
              />
              <Remark store={remarkModel}/>
              <DeliveryInformation store={deliveryInformationModel}/>
              <ReceivingInformation store={receivingInformation}/>
              <CommodityInformation store={commodityInformation}/>
              <OperationTime store={operationTimeModel}/>
              <SkuBreakUpModal store={skuBreakUpModel}/>
            </div>
          ) : ''}
        </Spin>
      </FullModal>
    );
  }
}
