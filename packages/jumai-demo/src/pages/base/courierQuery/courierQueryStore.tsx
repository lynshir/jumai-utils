
import { observable, action } from 'mobx';
import { message } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';

interface WaybillListInterface {
  code: any;
  status: string;
  statusTime: string;
  trace: string;
  waybillCode: string;
}
export default class Store {
  @observable public orderQueryVisible = false;// 订单查询显隐

  @observable public courierOrderNo: string;// 需要查询的快递单号

  @observable public courierOrderNo100: string;// 快递100需要查询的快递单号

  @observable public originalOrderNo: string;// 快递单号

  @observable public waybillList: WaybillListInterface[] = [];

  @observable public platformType: number;

  public saleOrderId: number;

  public params: {[key: string]: any; };

  @action
  public onOpen = (courierOrderNo: string, saleOrderId: number, platformType: number, params: {[key: string]: any; }) => {
    this.courierOrderNo = courierOrderNo;
    this.platformType = platformType ? Number(platformType) : platformType;
    this.originalOrderNo = courierOrderNo;
    this.courierOrderNo100 = courierOrderNo;
    this.saleOrderId = saleOrderId;
    this.params = params;
    this.orderQueryVisible = true;

    this.onPlatformQuery();
  };

  @action
  public onPlatformQuery = async() => {
    const req = await request<BaseData<WaybillListInterface[]>>({
      method: 'POST',
      url: '/api/saleorder/rest/courierTrace/queryByWaybillCode',
      data: {
        waybillCode: this.originalOrderNo,
        saleOrderId: this.saleOrderId,
      },
    });
    this.waybillList = req.data;
  };

  @action
  public onClose = () => {
    this.orderQueryVisible = false;
    this.courierOrderNo = undefined;
    this.platformType = undefined;
    this.saleOrderId = undefined;
    this.params = undefined;
    this.originalOrderNo = undefined;
    this.courierOrderNo100 = undefined;
    this.waybillList = [];
  };

  @action
  public setCourierOrderNo = (courierOrderNo: string) => {
    this.courierOrderNo = courierOrderNo;
  };

  public onQuery = () => {
    if (!this.courierOrderNo) {
      message.warning('请输入单号!');
      return;
    }

    try {
      // @ts-ignore
      window?.YQV5?.trackSingle({
        // 必须，指定承载内容的容器ID。
        YQ_ContainerId: 'YQContainer',

        // 可选，指定查询结果高度，最大为800px，默认为560px。
        YQ_Height: 780,

        // 必须，指定要查询的单号。
        YQ_Num: this.courierOrderNo,
      });
      document.getElementsByTagName('iframe')[0].height = '700';
    } catch (e) {
      console.log(e);
    }
  };
}

