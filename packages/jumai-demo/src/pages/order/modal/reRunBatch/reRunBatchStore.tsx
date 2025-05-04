import { message } from 'antd';
import type { FormInstance } from 'antd';
import type { BaseData } from 'jumai-utils';
import { Programme, request } from 'jumai-utils';
import { observable, action, computed, runInAction } from 'mobx';
import React from 'react';
import { api } from '../../../../utils/api';

export default class ReRunBatchStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public modalVisible = false;

  @observable public confirmLoading = false;

  @observable public formRef = React.createRef<FormInstance>();

  @observable public warehouseOptions;

  @observable public selectNum = 0;

  @observable public serviceType = [];

  @observable public platformPreShipmentType = [
    {
      description: '选中的订单',
      type: 1,
    },
    {
      description: '符合当前查询条件的订单',
      type: 2,
    },
  ];

  @computed public get saveDisabled(): boolean {
    return !this.serviceType.length;
  }

  // 模拟serviceType双向绑定
  @action public handleFieldChange = (changefields, allfields) => {
    console.log('changefileds......', changefields);
    if (changefields[0].name[0] === 'serviceType') {
      this.serviceType = changefields[0].value;
    }
  };

  @action public openModal = (): void => {
    const { selectRows } = this.parent.mainGridModel.gridModel;
    this.selectNum = selectRows.length;
    this.formRef.current?.setFieldsValue({ preLogisticType: !this.selectNum ? 2 : 1 });
    console.log(this.formRef.current?.getFieldsValue());
    this.modalVisible = true;
  };

  @action public closeModal = (): void => {
    this.formRef?.current.resetFields();
    this.serviceType = [];
    this.modalVisible = false;
    this.confirmLoading = false;
  };

  @action public submitModifyInfo = (): void => {
    if (this.confirmLoading) {
      return;
    }
    this.confirmLoading = true;
    const { serviceType, preLogisticType } = this.formRef.current?.getFieldsValue();
    const serviceTypeObj = {
      courier: 0,
      warehouse: 0,
      combineProduct: 0,
    };
    serviceType.forEach((item) => {
      serviceTypeObj[item] = 1;
    });
    const data: any = { ...serviceTypeObj };
    if (preLogisticType === 1) {
      const { selectedIds } = this.parent.mainGridModel.gridModel;
      data.orderIds = Array.from(selectedIds);
    } else {
      const params = this.parent.disposeAuthorName(this.parent.programme.filterItems.params);

      data.conditionBody = JSON.stringify({
        'courier_print_mark_state-4-14': 1,
        'checked_time-7-13': false,
        'is_suspended-3-1': false,
        ...params,
      });
    }

    request<BaseData>({
      url: api.reRunBatch,
      method: 'POST',
      data,
    }).then((res) => {
      message.info(res.info);
      this.closeModal();
    })
      .finally(() => {
        runInAction(() => {
          this.confirmLoading = false;
        });
      });
  };
}
