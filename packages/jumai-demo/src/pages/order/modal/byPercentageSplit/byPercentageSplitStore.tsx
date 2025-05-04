import { message } from 'antd';
import { renderModal } from 'jumai-common';
import type { BaseData } from 'jumai-utils';
import { request, BatchReport } from 'jumai-utils';
import _ from 'lodash';
import { observable, action, toJS } from 'mobx';
import React from 'react';
import { api } from '../../../../utils/api';

interface PercentageConfig{
  splitStockPercentage: number;
  id: number;
}

export default class BySkuSplitStore {
  constructor(options) {
    this.parent = options.parent;
  }
  
  @observable public parent;

  @observable public orderIds;

  @observable public byPercentageVisible = false;

  @observable public splitStockPercentage;

  @observable public preId;

  // 打开弹窗
  @action public openModal = (orderIds: string): void => {
    this.orderIds = orderIds;
    this.byPercentageVisible = true;
    this.getSplitConfig();
  };

  // 关闭弹窗
  @action public closeModal = (): void => {
    this.splitStockPercentage = '';
    this.byPercentageVisible = false;
  };
  
  @action public getSplitConfig = (): void => {
    request<BaseData<PercentageConfig>>({
      url: api.getPercentage,
      method: 'GET',
    }).then((res) => {
      this.splitStockPercentage = res.data.splitStockPercentage;
      this.preId = res.data.id;
    });
  };
  
  @action public onChange = (value) => {
    this.splitStockPercentage = value ? Number(value) : value;
  };

  // 拆分
  @action public handlePercentageSplit = async() => {
    console.log(this.splitStockPercentage);
    if (!this.splitStockPercentage) {
      message.warn('请输入拆分比例！');
      return;
    }

    const setData = {
      id: this.preId,
      splitStockPercentage: this.splitStockPercentage,
    };
    const setRes = await request<BaseData>({
      url: api.setPercentage,
      method: 'POST',
      data: setData,
    });

    const splitRes = await request({
      url: api.percentageSplit,
      method: 'POST',
      data: { orderIds: this.orderIds },
    });

    this.closeModal();
    this.handleShowFailDialog(splitRes);
    this.parent.resetTable();
  };

  private handleShowFailDialog = (data): void => {
    renderModal(
      <BatchReport
        {...data.data}
        columns={[
          {
            title: '订单编号',
            dataIndex: 'saleOrderNo',
          },
          {
            title: '失败原因',
            dataIndex: 'reason',
          },
        ]}
      />
    );
  };
}
