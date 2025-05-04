import { Modal } from 'antd';
import type{ FormInstance } from 'antd';
import type { DictData } from 'jumai-common';
import { objToDict, renderModal } from 'jumai-common';
import type { BatchReportData, BaseData } from 'jumai-utils';
import { request, BatchReport } from 'jumai-utils';
import { observable, action, runInAction } from 'mobx';
import React from 'react';
import { api } from '../../../utils/api';

interface ISuspendRes{
  failed: number;
  successed: number;
  total: number;
  operationName: string;
  list: failedSuspendOrder[];
}

interface failedSuspendOrder {
  reason: string;
  saleOrderNo: string;
}

interface ISuspendType{
  name: string;
  code?: string;
  type?: string;
}

export default class SuspendStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public visible = false;// 挂起原因modal

  @observable public confirmLoading = false;

  @observable public suspendFormRef = React.createRef<FormInstance>();

  @observable public suspendTypeList = [];

  @action public initSuspendTypeList = (): void => {
    request<BaseData<DictData>>({
      url: api.querySuspendType,
      method: 'GET',
    }).then((res) => {
      this.suspendTypeList = objToDict(res.data)?.map((item) => ({
        label: item.label,
        value: item.label,
      }));
      this.suspendFormRef.current?.setFieldsValue({ type: this.suspendTypeList[0].value });
    });
  };

  @action public showSuspendReasonModal = (): void => {
    this.initSuspendTypeList();
    this.visible = true;
  };

  @action public closeSuspendReasonModal = (): void => {
    this.suspendFormRef.current?.resetFields();
    this.visible = false;
    this.confirmLoading = false;
  };

  // 提交挂起信息
  @action public submitSuspendInfo = (): void => {
    const formInfo = this.suspendFormRef.current?.getFieldsValue();
    if (this.confirmLoading) {
      return;
    }
    this.confirmLoading = true;

    // 准备挂起数据
    const holdRemark = `挂起原因：${formInfo.type}` + `${formInfo.reason ? `(挂起说明：${formInfo.reason})` : ''}`;
    const { visible, orderId, getSaleOrder } = this.parent.orderDetailsModel || this.parent.orderDetailStore;// 查询和处理两个页面store命名不一样
    const ids = visible ? orderId.toString() : Array.from(this.parent.mainGridModel.gridModel.selectedIds).toString();

    const data = {
      holdRemark,
      ids,
    };

    request<BatchReportData>({
      url: api.suspendOrder,
      method: 'POST',
      data,
    }).then((res) => {
      this.closeSuspendReasonModal();
      const { failed, total, successed, operationName, list } = res.data;
      if (failed === 0) {
        Modal.success({
          title: '操作成功',
          content: visible ? '订单挂起成功' : `订单挂起成功，共${total}条`,
        });
        if (visible) {
          getSaleOrder(orderId);
        }
        this.parent.resetTable();
        return;
      }
      this.parent.resetTable();
      this.handleShowFailDialog(res);

      // this.parent.resetTable();
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
