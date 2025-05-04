import { message } from 'antd';
import { renderModal } from 'jumai-common';
import type { BatchReportData } from 'jumai-utils';
import { BatchReport, request } from 'jumai-utils';
import { action, observable } from 'mobx';
import React from 'react';

export default class ByWeight {
  @observable public limitWeight: number;

  @observable public visible = false;

  @observable public confirmLoading = false;

  public ids: string[] = [];

  @action
  public onShow = (ids: any[]) => {
    this.ids = ids;
    this.visible = true;
  };

  @action
  public setLimitWeight = (value) => {
    this.limitWeight = value;
  };

  @action
  public onOk = async(): Promise<void> => {
    try {
      if (!this.limitWeight) {
        message.warning('请填写拆分重量！');
        return;
      }
      this.confirmLoading = true;
      const req = await request<BatchReportData>({
        method: 'post',
        url: '/api/saleorder/rest/split/byWeight',
        data: {
          ids: this.ids,
          limitWeight: this.limitWeight,
        },
      });
      renderModal(
        <BatchReport
          {...req.data}
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
      this.onCancel();
    } catch (e) {
      console.error(e);
      this.confirmLoading = false;
    }
  };

  @action
  public onCancel = () => {
    this.visible = false;
    this.confirmLoading = false;
    this.limitWeight = undefined;
    this.ids = [];
  };
}
