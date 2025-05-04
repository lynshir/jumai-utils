import { message } from 'antd';
import { request, BaseData } from 'jumai-utils';
import { action, observable } from 'mobx';

export class ProductSettingModel {
  constructor(parent) {
    this.parent = parent;
  }

  @observable public parent;

  @observable public visible = false; // popover显隐

  @observable public displayType = [
    {
      label: '图片',
      value: 'image',
    },
    {
      label: 'SKU编码',
      value: 'sku',
    },
  ]; // 展示种类

  @observable public checkType = []; // 选择种类

  // 改变popover显隐
  @action
  public changeVisible = (visible) => {
    this.visible = visible;
    if (visible) {
      this.checkType = this.parent.parent.productDisplay.split(',');
    }
  };

  // 改变选择
  @action
  public changeCheckType = (value) => {
    this.checkType = value;
  };

  // 恢复默认
  @action
  public restoreDefault = () => {
    this.checkType = ['image'];
    this.updateShowImageConfig();
  };

  // 确定
  @action
  public submit = (): any => {
    if (!this.checkType.length) {
      return message.warning('请至少选择一项');
    }
    this.updateShowImageConfig();
  };

  // 修改配置
  @action
  public updateShowImageConfig = async() => {
    const req = await request({
      url: `/api/oms/rest/config/updateShowImageConfig?showImageConfig=${this.checkType.join(',')}`,
      method: 'post',
    });
    message.success('修改成功');
    this.visible = false;
    this.parent.parent.getShowImageConfig();
  };
}
