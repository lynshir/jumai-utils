import { message } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { action, observable } from 'mobx';

export default class ExportOrderModel {
  constructor(parent) {
    this.parent = parent;
  }

  @observable public parent;

  @observable public visible = false;

  @observable public phone = '';

  @observable public isGetVerificationCode = false;

  @observable public time = 60;

  @observable public verificationCode = '';

  @observable public timer = null;

  @observable public ids = '';

  @observable public params = '';

  @observable public queryParamShow = '';

  @observable public sheetName = '';

  @observable public sheetType = '';

  // 是哪个页面的导出，queryPage, 0:订单处理，1:订单查询
  @observable public pageType = 0;

  @action
  public changeVisible = (visible, ids, params, queryParamShow, sheetName, sheetType, pageType?: any) => {
    this.visible = visible;
    this.ids = ids;
    this.params = params;
    this.queryParamShow = queryParamShow;
    this.sheetName = sheetName;
    this.sheetType = sheetType;
    this.pageType = pageType;
    if (!visible) {
      this.clear();
      this.verificationCode = '';
    }
  };

  // 获取手机号
  @action
  public getPhone = async() => {
    const req = await request<BaseData<string>>({
      url: '/api/baseinfo/rest/mainAccount/mobile/get/',
      method: 'get',
    });
    this.phone = `${req.data.slice(0, 3)}****${req.data.slice(-4)}`;
  };

  // 获取验证码
  @action
  public getVerificationCode = async() => {
    const req = await request({
      url: '/api/baseinfo/rest/message/validCode/getCode',
      method: 'post',
      data: new URLSearchParams(Object.entries({ messageTemplateId: '178704' })),
    });
    this.isGetVerificationCode = true;
    this.count();
  };

  // 倒计时
  @action
  public count = () => {
    this.timer = setInterval(() => {
      this.time--;
      if (this.time < 1) {
        this.clear();
      }
    }, 1000);
  };

  // 清除
  @action
  public clear = () => {
    clearInterval(this.timer);
    this.time = 60;
    this.isGetVerificationCode = false;
  };

  @action
  public export = async() => {
    if (!this.verificationCode.length) {
      message.warning('请输入验证码');
      return;
    }

    const req = await request({
      url: '/api/baseinfo/rest/message/validCode/valid',
      method: 'post',
      data: new URLSearchParams(Object.entries({
        messageTemplateId: '38418',
        validCode: this.verificationCode,
      })),
    });
    this.parent.exportStore.onShow(this.sheetName, this.sheetType, this.ids, this.params, this.queryParamShow, {
      ifDecrypt: 1,
      queryPage: this.pageType,
    });
    this.changeVisible(false, '', '', '', '', '', this.pageType);
  };
}
