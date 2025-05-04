import { Modal } from 'antd';
import type { FormInstance } from 'antd';
import { renderModal } from 'jumai-common';
import { request, BatchReport } from 'jumai-utils';
import type { BatchReportData, BaseData } from 'jumai-utils';
import { observable, action, runInAction } from 'mobx';
import React from 'react';
import { api } from '../../../../utils/api';

interface IRes{
  failed: number;
  successed: number;
  total: number;
  operationName: string;
  list: [];
}

export default class ModifyRemarkStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public loading = false;

  @observable public modalVisible = false;

  @observable public remarkKey = 'systemMemo';// 外部传入的表单项key

  @observable public formRef = React.createRef<FormInstance>();

  @observable public remarkInfo = {
    systemMemo: {
      key: 'systemMemo',
      label: '订单备注',
      title: '修改订单备注',
      url: '/api/saleorder/rest/memo/updateSystemMemo',
    },
    sellerMemo: {
      key: 'sellerMemo',
      label: '客服备注',
      title: '修改客服备注',
      url: '/api/saleorder/rest/memo/updateSellerMemo',
    },
    note: {
      key: 'content',
      label: '便签',
      title: '修改便签',
      url: api.updateNote,
    },
  };

  @action public openModal = (key: string): void => {
    this.remarkKey = key;
    this.modalVisible = true;
  };

  @action public closeModal = (): void => {
    this.formRef?.current.resetFields();
    this.modalVisible = false;
  };

  @action public submitModifyInfo = (): void => {
    const selectedIds = Array.from(this.parent.mainGridModel.gridModel.selectedIds);
    const ids = [
      'note',
      'sellerMemo',
      'systemMemo',
    ].includes(this.remarkKey) ? selectedIds : selectedIds.toString();
    const formInfo = this.formRef.current?.getFieldsValue();
    const data = Object.assign(formInfo, { ids });
    this.loading = true;
    request<BatchReportData>({
      url: this.remarkInfo[this.remarkKey].url,
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
          this.loading = false;
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
