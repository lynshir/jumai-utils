import { observable, action } from 'mobx';
import { message } from 'antd';
import type { Store as OrderStore } from '../../store';
// import type ExportOrderStore from '../../../expertOrder/mainModel';

type ParentStore = OrderStore | any;

export default class DropShippingTipStore {
  constructor(options: { parent: ParentStore; }) {
    this.parent = options.parent;
  }

  public parent: ParentStore;

  public selectedRows = [];// 选中的订单

  public queryParams;// 查询条件

  @observable public visible = false;

  @observable public value = 1;

  @observable public selectedOrderDisabled = false;// 选中行选项disabled

  @action public toggleDropModal = (visible: boolean, selectedRows?, queryParams?) => {
    if (visible) {
      this.selectedRows = selectedRows;
      this.queryParams = queryParams;

      // 打开弹窗
      if (!selectedRows.length) {
        // 没有选中行
        this.value = 2;
        this.selectedOrderDisabled = true;
      } else {
        this.value = 1;
        this.selectedOrderDisabled = false;
      }
    }
    this.visible = visible;
  };

  @action public handleValueChange = (val) => {
    this.value = val;
  };

  @action public handleOk = () => {
    this.toggleDropModal(false);

    // @ts-ignore
    const pageType = this.parent.pageType === 'expertOrder' ? 2 : 1;

    // 有选中的订单
    if (this.value === 1) {
      const isNotIssuing = this.selectedRows.every((item) => {
        return String(item.proxySendStatus) === '1' || String(item.proxySendStatus) === '3';
      });
      if (!isNotIssuing) {
        message.warning('请选择未代发或取消代发的订单！');
        return;
      }

      if (isNotIssuing && !this.selectedRows.every((item) => item.courierVo.courierId)) {
        message.warning('请先选择快递公司');
        return;
      }
      if (!this.selectedRows.every((item) => item.isSuspended !== 1)) {
        message.warning('请选择未挂起的订单！');
        return;
      }
      const ids = this.selectedRows.map((item) => item.saleOrderId);
      const tenantIds = this.selectedRows.map((item) => item.tenantId);
      console.log(`/jumai-ts-oms/wholeSalePage?ids=${ids}&tenantIds=${tenantIds}&pageType=${pageType}`);
      window.top.egenie.openTab(`/jumai-ts-oms/wholeSalePage?ids=${ids}&tenantIds=${tenantIds}&pageType=${pageType}`, 'wholeSalePage', '代发');
      this.showAfterTip();
    } else {
      if (this.queryParams['proxy_send_status-4-10'] !== '1') {
        message.warning('代发时必须使用【代发状态】查询条件，请选择未代发');
        return;
      }

      console.log(`/jumai-ts-oms/wholeSalePage?vo=${JSON.stringify(this.queryParams)}&pageType=${pageType}`);
      window.top.egenie.openTab(`/jumai-ts-oms/wholeSalePage?vo=${JSON.stringify(this.queryParams)}&pageType=${pageType}`, 'wholeSalePage', '代发');
      this.showAfterTip();
    }
  };

  private showAfterTip = () => {
    // 订单处理页面才展示提示框
    // @ts-ignore
    if (this.parent.pageType !== 'expertOrder') {
      // @ts-ignore
      this.parent.dropShippingAfterTipsStore.show();
    }
  };
}
