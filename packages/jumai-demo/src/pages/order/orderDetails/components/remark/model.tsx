
import { message } from 'antd';
import type{ FormInstance } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { observable, action, extendObservable, computed } from 'mobx';
import React from 'react';
import type parentModel from '../../model';

export default class {
  constructor(parent: parentModel) {
    this.parent = parent;
  }

  public parent: parentModel;

  public formRef = React.createRef<FormInstance>();

  public serFormValues = (obj) => {
    this.formRef.current.setFieldsValue(obj);
  };

  @action
  public onSave = async(data) => {
    await request<BaseData>({
      method: 'POST',
      url: '/api/saleorder/rest/memo/updateSellerMemoAndSystemMemo',
      data: {
        ...data,
        orderId: this.parent.orderId,
      },
    });
    message.success('操作成功');
  };

  @action
  public onSaveFlag = async(obj) => {
    const req = await request<BaseData>({
      method: 'POST',
      url: '/api/oms/rest/memo/upStreamMemoAndFlag',
      data: {
        ...obj,
        saleOrderId: this.parent.orderId,
      },
    });
    message.success(req.data);
  };
}
