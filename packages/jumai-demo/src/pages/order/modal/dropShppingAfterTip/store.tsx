import { observable, action } from 'mobx';
import type { Store as ParentStore } from '../../store';

export default class Store {
  constructor(parent: ParentStore) {
    this.parent = parent;
  }

  private parent: ParentStore;

  @observable public visible = false;

  @action
  public show = () => {
    this.visible = true;
  };

  @action
  public close = () => {
    this.visible = false;
  };

  /**
   * 跳转我的订单页面，待付款状态
   */
  @action
  public onClickQuestionButton = () => {
    window.top.egenie.openTab('/jumai-ts-vogue/myorder/index?orderStatus=0', 753, '我的订单');
  };

  /**
   * 跳转我的订单页面
   */
  @action
  public onClickMyOrderButton = () => {
    window.top.egenie.openTab('/jumai-ts-vogue/myorder/index', 753, '我的订单');
  };

  /**
   * 关闭弹窗，刷新表格
   */
  @action
  public onClickContinueButton = () => {
    this.visible = false;
    this.parent.resetTable();
  };
}
