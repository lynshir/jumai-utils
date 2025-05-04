import { message, Modal } from 'antd';
import type { FormInstance } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { observable, action, computed, toJS } from 'mobx';
import React from 'react';
import { api } from '../../../../utils/api';

interface Label {
  key: number;
  value: string;
  showEdit: boolean;
}

export default class Store {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public setMemoVisible = false;

  @observable public showRadio = true;

  @observable public operateFlag = '';

  @observable public labelList: Label[] = [];

  @observable public labelRef = React.createRef<FormInstance>();// 整个labelRef

  @observable public labelName = '';// popover框内值;

  @observable public addLabelVisible = false;

  @observable public amFlag = false; // 新增或编辑flag true为编辑

  @observable public editLabelIndex;

  // 系统标签
  @computed
  public get systemLabelList() {
    return this.labelList.filter((i) => i.key < 0);
  }

  // 非系统标签
  @computed
  public get manualLabelList() {
    return this.labelList.filter((i) => i.key >= 0);
  }

  @computed public get saveDisabled(): boolean {
    return !this.operateFlag;
  }

  @computed public get showLabel(): boolean {
    return this.operateFlag === '0' || this.operateFlag === '1';
  }

  @observable public openMemoModal = (): void => {
    this.setMemoVisible = true;
  };

  @observable public closeMemoModal = (): void => {
    this.operateFlag = '';
    this.labelList = [];
    this.addLabelVisible = false;
    this.setMemoVisible = false;
    this.labelRef?.current?.resetFields();
  };

  @action public onOperationChange = (e): void => {
    const newVal = e.target.value;
    this.operateFlag = newVal;
  };

  @action public closeLabelPopover = (): void => {
    if (!this.amFlag) {
      this.addLabelVisible = false;
    }
    this.labelName = '';
    if (this.labelList[this.editLabelIndex]) {
      this.labelList[this.editLabelIndex].showEdit = false;
    }
  };

  // 点击pop框外其他位置关闭pop框
  @action public handlePopoverVisibleChange = (visible): void => {
    if (!this.amFlag) {
      this.addLabelVisible = visible;
      return;
    }
    if (this.labelList[this.editLabelIndex]) {
      this.labelList[this.editLabelIndex].showEdit = visible;
    }
  };

  @action public handleLabelChange = (e): void => {
    this.labelName = e.target.value;
  };

  // 打开编辑标签气泡框
  @action public openEditLabelPop = (key: number, value): void => {
    this.amFlag = true;
    const index = this.labelList.findIndex((i) => i.key === key);
    this.editLabelIndex = index;
    this.addLabelVisible = false;// 将添加标签的气泡框显隐藏设为false
    this.labelList = this.labelList.map((item, idx) => {
      Object.assign(item, { showEdit: index === idx });
      return item;
    });
    this.labelName = value;
  };

  // 打开新增标签气泡框
  @action public openAddLabelPop = (): void => {
    this.amFlag = false;
    this.labelName = '';

    // 将所有编辑pop关闭
    this.labelList = this.labelList.map((item) => {
      Object.assign(item, { showEdit: false });
      return item;
    });
    this.addLabelVisible = true;
  };

  @action public setAmFlag = (flag: boolean): void => {
    this.amFlag = flag;
  };

  @action public initLabelList = async() => {
    const res = await request<BaseData<Array<{
      tagId: number;
      tagName: string;
      selectable: boolean;
    }>>>({
      url: api.getAllLabelsV2,
      method: 'GET',
    });
    const tempData = res.data;

    // 处理成数组，不可手动添加或删除的表标签不展示
    this.labelList = tempData.filter((i) => i.selectable).map((item) => {
      return {
        key: item.tagId,
        value: item.tagName,
        showEdit: false, // 展示编辑气泡框
      };
    })
      .sort((a, b) => {
        return Number(a.key) - Number(b.key);
      });
  };

  // 处理标签(新增或编辑)
  @action public dealLabel = (): void => {
    const labelName = this.labelName;
    if (!labelName) {
      message.warn('请填写标签名称');
      return;
    }

    if (!labelName.match(/^[\u2E80-\u9FFF\w]{1,10}$/)) {
      message.warn('标签名称只能为数字、字母、下划线、中文且长度不超过10');
      return;
    }

    // 校验重复
    if (this.labelList?.some((item) => item.value === labelName)) {
      message.warn('不能输入重复标签');
      return;
    }
    request<BaseData>({
      url: this.amFlag ? api.updateLabel : `${api.createNewLabel}?labelName=${labelName}`,
      method: this.amFlag ? 'POST' : 'GET',
      data: this.amFlag && {
        id: this.labelList[this.editLabelIndex].key,
        labelName,
      },
    }).then((res) => {
      message.success(res.info);
      this.addLabelVisible = false;
      this.initLabelList();
    });
  };

  // 删除标签
  @action public deleteLabel = (labelKey): void => {
    Modal.confirm({
      title: '确认删除该标签吗？',
      onOk: () => {
        request<BaseData>({
          url: `${api.deleteLabel}/${labelKey}`,
          method: 'DELETE',
        }).then((res) => {
          message.success(res.info || '删除标签成功');
          this.initLabelList();
        });
      },
    });
  };

  // 更新整个订单标签
  @action public updateOrderLabels = (): void => {
    let ids: string;
    if (this?.parent?.parent?.visible) {
      ids = `${this.parent?.parent?.orderId }`;
    } else {
      ids = Array.from(this.parent.mainGridModel.gridModel.selectedIds).toString();
    }
    console.log('first', toJS(this.labelRef.current?.getFieldsValue()));
    const newLabels = this.labelRef.current?.getFieldsValue().newLabels;

    if (this.operateFlag !== '2' && (!newLabels || !newLabels.length)) {
      message.warn('至少选择一个标签');
      return;
    }
    const data = {
      ids,
      newLabels: this.operateFlag === '2' ? '' : this.labelRef.current?.getFieldsValue().newLabels?.toString(),
      operateFlag: this.operateFlag,
    };
    request<BaseData>({
      url: api.updateOrderLabels,
      method: 'POST',
      data,
    }).then((res) => {
      message.success(res.data);
      if (this?.parent?.parent?.visible) {
        this.parent?.parent?.getPostSaleOrder(this.parent?.parent?.orderId);
      } else {
        this.parent.mainGridModel.onRefresh();
      }
      this.closeMemoModal();
      this.parent?.resetTable && this.parent?.resetTable();
    });
  };
}
