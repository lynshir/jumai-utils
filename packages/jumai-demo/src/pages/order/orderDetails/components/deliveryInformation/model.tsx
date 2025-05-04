import { message } from 'antd';
import type { FormInstance } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { observable, action, extendObservable, computed } from 'mobx';

import React from 'react';
import type parentModel from '../../model';

export default class {
  constructor(parent: parentModel) {
    this.parent = parent;
    this._init();
  }

  @action
  public _init = () => {
    this.getEnabledList();
    this.getCourierList();
  };

  @observable public warehouseList = [];// 仓库集合

  @observable public courierList = [];// 快递集合

  public parent: parentModel;

  public formRef = React.createRef<FormInstance>();

  public serFormValues = (obj) => {
    this.formRef.current.setFieldsValue(obj);
  };

  @action
  public getEnabledList = async() => {
    const req = await request<BaseData<Array<{ warehouseName: string;warehouseId: number; }>>>({
      method: 'GET',
      url: '/api/baseinfo/rest/warehouse/enabledList',
    });
    this.warehouseList = req.data.map((item) => {
      return {
        label: item.warehouseName,
        value: item.warehouseId,
      };
    });
  };

  @action
  public getCourierList = () => {
    const { dict } = this.parent?.parent?.programme?.filterItems;
    this.courierList = (dict['courier_id-4-14'] || [])?.map((item) => {
      return {
        label: item.label,
        value: Number(item.value),
      };
    });
  };

  @action
  public updateWarehouseOrDelivery = async(id, type) => {
    const url = type === 1 ? '/api/oms/rest/updateSaleOrderWarehouseId' : '/api/oms/rest/updateSaleOrderCourierId';
    const req = await request<BaseData>({
      method: 'POST',
      url,
      data: {
        orderId: this.parent.orderId,
        [type === 1 ? 'warehouseId' : 'courierId']: id,
      },
    });
    message.success('操作成功');
  };
}
