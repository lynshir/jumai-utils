import { message } from 'antd';
import type { FormInstance } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { observable, action } from 'mobx';
import React from 'react';
import { api } from '../../../utils';

export default class RemarkStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public visible = false;

  @observable public remarkFormRef = React.createRef<FormInstance>();

  // 提交备注信息
  @action public submitRemark = async() => {
    const data = this.remarkFormRef.current?.getFieldsValue();
    const ids = Array.from(this.parent.mainGridModel.gridModel.selectedIds);
    const statusRes = await request<BaseData>({
      url: api.uploadRemark,
      method: 'POST',
      data: {
        ids,
        ...data,
      },
    });
    this.closeRemarkModal();
    this.parent.mainGridModel.gridModel.onRefresh();
    this.parent.mainGridModel.gridModel.selectedIds = new Set();
    message.success(statusRes.info);
  };

  // 插入模版信息
  @action public insertTemplate = (name: string): void => {
    // 获取现有input框内的值
    const inputVal = this.remarkFormRef.current?.getFieldsValue().notes || '';

    // 检查目前note框内的值是否已经包括模版内容
    const notes = inputVal.includes(`#{${name}}`) ? inputVal.replace(`#{${name}}`, '') : `${inputVal}#{${name}}`;
    this.remarkFormRef.current?.setFieldsValue({ notes });
  };

  @action public openRemarkModal = (): void => {
    this.visible = true;
  };

  @action public closeRemarkModal = (): void => {
    this.remarkFormRef.current?.resetFields();
    this.visible = false;
  };
}
