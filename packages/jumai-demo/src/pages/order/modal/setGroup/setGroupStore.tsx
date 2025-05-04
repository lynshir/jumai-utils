import { message, Modal } from 'antd';
import type { BaseData } from 'jumai-utils';
import { EgGridModel, request } from 'jumai-utils';
import { observable, action } from 'mobx';
import { nanoid } from 'nanoid';
import { api } from '../../../../utils/api';

interface IGroup{
  groupNo: string;
  num: number;
}
export default class Store {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public loading = false;

  @observable public setGroupVisible = false;

  @action public initGroup = (): Promise<unknown> => {
    return request<BaseData<IGroup[]>>({
      url: api.getGroup,
      method: 'GET',
    }).then((res) => {
      this.groupGridModel.rows = res.data?.map((item) => ({
        key: nanoid(),
        ...item,
      }));
    });
  };

  @observable public groupGridModel = new EgGridModel({
    columns: [
      {
        key: 'num',
        name: '组内订单数',
        width: 120,
      },
      {
        key: 'groupNo',
        name: '组号',
      },
    ].map((item) => ({
      ...item,
      frozen: true,
    })),
    rows: [],
    primaryKeyField: 'key',
    showPagination: false,
    showCheckBox: true,
    api: { onQuery: this.initGroup },
  });

  @observable public openGroupModal = (): void => {
    this.groupGridModel.onQuery();
    this.setGroupVisible = true;
  };

  @observable public closeGroupModal = (): void => {
    this.groupGridModel.rows = [];
    this.groupGridModel.resetAllSelectedRows();
    this.groupGridModel.cursorRow = {};
    this.setGroupVisible = false;
  };

  // 合并分组
  @action public confirm = async(): Promise<void> => {
    await new Promise(((resolve, reject) => {
      Modal.confirm({
        title: '组号合并后无法还原，请谨慎操作！',
        onOk: () => {
          resolve(true);
        },
        onCancel: () => {
          reject();
        },
      });
    }));
    const groupNos = this.groupGridModel.selectRows.map((item) => item.groupNo).join(',');
    this.loading = true;
    const checkMergeRes = await request<BaseData>({
      url: api.checkMergeGroup,
      method: 'POST',
      data: { groupNos },
    });

    const mergeFunc = () => {
      request<BaseData>({
        url: api.mergeGroup,
        method: 'POST',
        data: { groupNos },
      }).then((mergeRes) => {
        this.loading = false;
        message.success('合并成功');
        this.closeGroupModal();
      });
    };

    if (checkMergeRes.data) {
      Modal.confirm({
        title: checkMergeRes.data,
        onOk: mergeFunc,
        onCancel: () => {
          this.loading = false;
        },
      });
    } else {
      mergeFunc();
    }
  };
}
