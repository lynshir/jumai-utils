import type { FormInstance } from 'antd';
import { message } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { action, observable, toJS } from 'mobx';
import React from 'react';
import type { IParentStore } from '../../store';

export default class {
  constructor(parent: IParentStore) {
    this.parent = parent;
  }

  @observable public formRef = React.createRef<FormInstance>();

  @observable public visible = false;

  @observable public confirmLoading = false;

  public parent: IParentStore;

  public get selectNum() {
    return Array.from(this.parent.mainGridModel.gridModel.selectedIds)?.length;
  }

  @action
  public onBulkExchangeClick = () => {
    this.visible = !this.visible;
    if (!this.visible) {
      this.formRef?.current?.resetFields();
    }
  };

  @action
  public onOk = (): any => {
    const {
      validateFields,
      getFieldValue,
    } = this.formRef?.current;
    const changeType = getFieldValue('changeType');
    if (changeType === 'selected' && this.selectNum === 0) {
      return message.warning('请先选中订单后再操作');
    }
    if (this.confirmLoading) {
      return;
    }
    this.confirmLoading = true;
    validateFields()
      .then((params) => {
        try {
          let _params: any = {
            orderIdList: Array.from(this.parent.mainGridModel.gridModel.selectedIds)
              .join(','),
          };
          if (changeType === 'match_condition') {
            _params = { ...toJS(this.parent.disposeAuthorName(this.parent.programme.filterItems.params)) };
          }
          if (params?.oldSkuNo?.trim() === params?.newSkuNo?.trim()) {
            message.warning('新SKU编码不能与原SKU编码相同');
            this.confirmLoading = false;
            return;
          }
          _params.newSkuNo = params.newSkuNo.trim();
          _params.changeType = changeType;

          const replaceType = getFieldValue('replaceType');
          let url = '';
          if (replaceType === 'skuNo') {
            url = '/api/oms/rest/batchChangeBySkuNo';
            _params.oldSkuNo = params.oldSkuNo.trim();
          } else if (replaceType === 'skuId') {
            url = '/api/oms/rest/batchChangeByPlatformSkuId';
            _params.platformSkuId = params.platformSkuId.trim();
          } else if (replaceType === 'noSku') {
            url = '/api/oms/rest/batchChangeAllDetails';
          }

          request<BaseData<string>>({
            method: 'POST',
            url,
            data: _params,
          })
            .then((req) => {
              message.success(req.data);
              this.onBulkExchangeClick();
            })
            .finally(() => {
              this.confirmLoading = false;
            });
        } catch (e) {
          this.confirmLoading = false;
          console.error(e);
        }
      })
      .catch(() => {
        this.confirmLoading = false;
      });
  };
}
