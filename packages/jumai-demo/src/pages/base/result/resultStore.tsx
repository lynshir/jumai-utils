import { message, Modal } from 'antd';
import { EgGridModel, request } from 'jumai-utils';
import type { BaseData } from 'jumai-utils';
import { observable, action } from 'mobx';
import { api } from '../../../utils/api';

interface IOperationRes{
  failed: number;
  successed: number;
  total: number;
  operationName: string;
  list: OperItem[];
}

interface OperItem{
  saleOrderNo: number;
  reason: string;
}

export default class Store {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public resultVisible = false;// 结果显隐modal

  @observable public uncheckFlag = false;// 是否为反审核订单（反审核需确认）

  @observable public resData = {
    total: 0,
    failed: 0,
    successed: 0,
    operationName: '',
  };// 结果数据

  @observable public resultText = '';// 用于复制

  private orderIds: string = null;

  private callback: () => void = null;

  @observable public failedGrid = new EgGridModel({
    columns: [
      {
        key: 'saleOrderNo',
        name: '订单编号',
      },
      {
        key: 'reason',
        name: '失败原因',
      },
    ],
    rows: [],
    primaryKeyField: 'saleOrderNo',
    showCheckBox: false,
    showPager: false,
  });// 失败表格

  // 打开结果弹窗
  @action public showResultModal = (ids?: string, cb?: () => void): void => {
    this.resultVisible = true;
    this.orderIds = ids;
    this.callback = cb;
  };
    
  // 关闭结果弹窗
  @action public closeResultModal = (): void => {
    this.resultVisible = false;
    this.orderIds = null;
    this.callback = null;
  };

  public onCopy = (): void => {
    message.success('复制成功');
  };

  // 继续反审核
  @action public goOnUncheck = (): void => {
    this.resultVisible = false;
    request<BaseData<IOperationRes>>({
      url: api.uncheckOrders,
      method: 'POST',
      data: { saleOrderIds: this.orderIds?.split(',') },
    }).then((res) => {
      const { failed, total, successed, operationName, list } = res.data;
      if (failed === 0) {
        Modal.success({
          title: '操作成功',
          content: `${operationName}成功，共${total}条`,
        });
        this.parent.resetTable();
        this.callback?.();
        this.closeResultModal();
        return;
      }
    
      this.resData = {
        operationName,
        failed,
        total,
        successed,
      };
      this.failedGrid.rows = list;

      // 记录表格内容用于复制
      let temp = '';
      list.forEach((item, index) => {
        const eachItem = `${(index + 1)}  ${item.saleOrderNo}  ${item.reason}
`;
        temp += eachItem;
      });
      this.resultText = temp;
      this.resultVisible = true;
    });
  };
}
