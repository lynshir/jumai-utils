
import { Modal } from 'antd';
import type{ FormInstance } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import _ from 'lodash';
import { observable, action } from 'mobx';
import qs from 'qs';
import React from 'react';
import { api } from '../../../utils/api';

interface IMemo{
  content: string;
  create_time_str: string;
  show_name: string;
}

export default class Store {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public memoVisible = false; // 便签弹窗显隐

  @observable public memoRef = React.createRef<FormInstance>();

  @observable public operationId: string;// 正在操作的id号 目前用于便签

  private row;

  // 打开便签弹窗
  @action public showMemoModal = (id: string, row): void => {
    this.operationId = id;
    this.row = row;
    this.initMemoInfo(id);
    this.memoVisible = true;
  };

  // 关闭便签弹窗
  @action public closeMemoModal = (): void => {
    this.memoRef.current?.resetFields();
    this.memoVisible = false;
  };

  // 初始化便签信息
  @action public initMemoInfo = (id: string, row?): void => {
    request<BaseData<IMemo[]>>({
      url: `${api.queryNote}/${id}`,
      method: 'GET',
    }).then((res) => {
      const displayMemoInfo = this.dealMemoDisplay(res.data);
      this.memoRef.current?.setFieldsValue({ memoInfo: displayMemoInfo });

      if (row) {
        const operateIndex = this.parent.programme.gridModel.gridModel.rows.findIndex((item) => item.saleOrderId == id);
        const updatedRow = Object.assign(row, { memoInfo: res.data });
        this.parent.programme.gridModel.gridModel.rows.splice(operateIndex, 1, updatedRow);
      }
    });
  };

  // 新增便签
  @action public addMemoInfo = (): void => {
    const content = this.memoRef.current?.getFieldValue(['content']);
    if (!content) {
      Modal.warning({
        title: '提示',
        content: '请填入信息',
      });
      return;
    }

    const data = { content };

    request<BaseData<IMemo[]>>({
      url: `${api.addNote}/${this.operationId}`,
      method: 'POST',
      headers: { contentType: 'application/x-www-form-urlencoded; charset=UTF-8' },
      data: qs.stringify(data),
    }).then((res) => {
      const displayMemoInfo = this.dealMemoDisplay(res.data);
      this.memoRef.current?.setFieldsValue({
        memoInfo: displayMemoInfo,
        content: '',
      });

      // 新增便签后不刷新页面
      // this.parent.programme.gridModel.onQuery();
      if (this.row) {
        const operateIndex = this.parent.programme.gridModel.gridModel.rows.findIndex((item) => item.saleOrderId == this.operationId);
        const updatedRow = Object.assign(this.row, { haveNotes: true });
        this.parent.programme.gridModel.gridModel.rows.splice(operateIndex, 1, updatedRow);
      }
    });
  };

  // 处理便签内容展示
  private dealMemoDisplay = (memoInfo: IMemo[]): string => {
    let displayMemoInfo = '';
    memoInfo.forEach((item) => {
      const eachInfo = `${item.create_time_str} ${item.show_name}
${item.content}
`;
      displayMemoInfo += eachInfo;
    });
    return displayMemoInfo;
  };
}

