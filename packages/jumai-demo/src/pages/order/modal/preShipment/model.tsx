import { message, Modal } from 'antd';
import type { FormInstance } from 'antd';
import { request } from 'jumai-utils';
import { observable, action } from 'mobx';
import React from 'react';
import { api } from '../../../../utils';

export class PreShipmentModel {
  constructor(options) {
    this.parent = options.parent;
    this.init();
  }

  @observable public parent;

  @observable public visible = false; // 预发货modal

  @observable public preShipmentFormRef = React.createRef<FormInstance>();

  @observable public selectNum = 0;

  @observable public platformPreShipmentType = [];

  @action
  public init = (): void => {
    request({ url: api.platformPreShipmentType }).then((res: { data?: []; }) => {
      this.platformPreShipmentType = res.data;
    });
  };

  /**
   * 保存预发货
   */
  @action
  public savePreShipmentInfo = async(params): Promise<void> => {
    request({
      method: 'post',
      url: api.savePreShipmentInfo,
      data: params,
    }).then((res: { data?: string; }) => {
      message.success(res.data);
    })
      .catch((err) => {
        message.error(err.data);
      });
  };

  @action
  public showPreShipmentModal = (): void => {
    const { selectRows } = this.parent.mainGridModel.gridModel;
    this.visible = true;
    this.selectNum = selectRows.length;
    this.preShipmentFormRef.current?.setFieldsValue({ preLogisticType: !this.selectNum ? 2 : 1 });
  };

  @action
  public closePreShipmentModal = (): void => {
    this.preShipmentFormRef.current?.resetFields();
    this.visible = false;
  };

  @action
  public submitPreShipmentInfo = (): void => {
    const preShipmentType = this.preShipmentFormRef.current?.getFieldsValue().preLogisticType;
    if (preShipmentType === 2) {
      this.visible = false;
      Modal.confirm({
        title: '系统将根据你设置的条件执行平台预发货，是否确认执行？',
        onOk: () => this.savePreShipmentInfo({
          ...this.parent.mainGridModel.getFilterParams(),
          preLogisticType: 2,
        }),
        onCancel: () => {
          this.visible = true;
        },
      });
    } else {
      this.savePreShipmentInfo({
        ...this.parent.mainGridModel.getFilterParams(),
        preLogisticType: 1,
        logisticSaleOrderIdList: Array.from(this.parent.mainGridModel.gridModel.selectedIds),
      });
      this.visible = false;
    }
  };
}
