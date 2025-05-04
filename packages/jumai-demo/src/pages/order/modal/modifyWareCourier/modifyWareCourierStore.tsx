import { Modal } from 'antd';
import type { FormInstance } from 'antd';
import { renderModal } from 'jumai-common';
import type { BaseData } from 'jumai-utils';
import { request, BatchReport } from 'jumai-utils';
import { observable, action, computed, runInAction } from 'mobx';
import React from 'react';
import { api } from '../../../../utils/api';

interface IRes{
  failed: number;
  successed: number;
  total: number;
  operationName: string;
  list: [];
}

export default class ModifyWareCourierStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public loading = false;

  @observable public modalVisible = false;

  @observable public formRef = React.createRef<FormInstance>();

  @computed public get warehouseOptions() {
    return this.parent.programme.filterItems.dict['warehouse_id-4-13'];
  }

  @computed public get courierOptions() {
    return this.parent.programme.filterItems.dict['courier_id-4-14'];
  }

  @action public openModal = (): void => {
    this.modalVisible = true;
  };

  @action public closeModal = (): void => {
    this.formRef?.current.resetFields();
    this.modalVisible = false;
  };

  @action public submitModifyInfo = (): void => {
    const ids = Array.from(this.parent.mainGridModel.gridModel.selectedIds).toString();
    const formInfo = this.formRef.current?.getFieldsValue();
    const data = Object.assign(formInfo, { ids });
    this.loading = true;
    request<BaseData<IRes>>({
      url: api.updateWarehouseAndCourier,
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
        this.parent.mainGridModel.gridModel.rows = [];
        setTimeout(() => {
          this.parent.mainGridModel.gridModel.onRefresh();
          this.parent.mainGridModel.gridModel.selectedIds = new Set();
        }, 1000);

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
