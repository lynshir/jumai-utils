import { message, Modal } from 'antd';
import { renderModal } from 'jumai-common';
import { request, BatchReport } from 'jumai-utils';
import type { BatchReportData } from 'jumai-utils';
import { observable, action, runInAction } from 'mobx';
import React from 'react';
import { api } from '../../../../utils/api';

export default class ModifyRemarkStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public detailText = '';

  @observable public modalVisible = false;

  @observable public confirmLoading = false;

  @action public openModal = (): void => {
    this.modalVisible = true;
  };

  @action public closeModal = (): void => {
    this.detailText = '';
    this.modalVisible = false;
    this.confirmLoading = false;
  };

  @action public handleTextChange = (e): void => {
    this.detailText = e.target.value;
  };

  @action public handleSplit = (): void => {
    if (this.detailText !== '确认拆分') {
      message.warn('请输入确认拆分');
      return;
    }
    if (this.confirmLoading) {
      return;
    }
    this.confirmLoading = true;
    const selectedArray = Array.from(this.parent.mainGridModel.gridModel.selectedIds);
    const data = selectedArray.map((v) => `orderIDs=${v}&`).join('');

    request<BatchReportData>({
      url: api.detailSplit,
      method: 'POST',
      data,
    }).then((res) => {
      this.closeModal();
      const { failed, total, successed, operationName, list } = res.data;
      if (failed === 0) {
        Modal.success({
          title: '操作成功',
          content: `${operationName}成功，共${total}条`,
        });
        this.parent.resetTable();
        return;
      }
      this.handleShowFailDialog(res);
      this.parent.resetTable();
    })
      .finally(() => {
        runInAction(() => {
          this.confirmLoading = false;
        });
      });
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
