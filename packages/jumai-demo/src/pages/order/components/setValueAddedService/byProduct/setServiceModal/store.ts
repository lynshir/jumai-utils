import { observable, action, computed } from 'mobx';
import type { Service } from '../interface';
import type ParentStore from '../store';
import type { Material } from '../../interface';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { message } from 'antd';

export default class SetServiceStore {
  constructor(parent: ParentStore) {
    this.parent = parent;
  }

  public parent: ParentStore;

  @observable public visible = false;

  @observable public loading = false;

  @observable private goodsIds: number[] = [];

  public rootStore = () => {
    return this.parent?.parent;
  };

  @observable public services: Service[] = [];

  @action
  public onOpen = (goodsIds: number[]) => {
    this.services = this.rootStore().defaultServices;
    this.visible = true;
    this.goodsIds = goodsIds;
    if (goodsIds.length === 1) {
      this.getServiceConfig(goodsIds[0]);
    }
  };

  // 获取单个商品的增值服务配置
  @action
  private getServiceConfig = async(goodsId: number) => {
    try {
      this.loading = true;
      const { data } = await request<BaseData<{
        detail: Service[];
      }>>({
        url: `/api/cloud/baseinfo/rest/value/added/external/proxy/platform/goods/config/${goodsId}`,
        method: 'GET',
      });
      this.services = data.detail;
    } finally {
      this.loading = false;
    }
  };

  @action
  public onClose = () => {
    this.visible = false;
    this.services = this.rootStore().defaultServices;
    this.goodsIds = [];
  };

  // 修改服务启用状态
  @action
  public onServiceEnableChange = (index: number, checked: boolean) => {
    this.services[index].enable = checked;
  };

  // 修改物料
  @action
  public onMaterialChange = (material: Material) => {
    const materialIndex = this.services.findIndex((item) => item.valueAddedType === material.materialType);
    this.services[materialIndex].material = material;
    this.services[materialIndex].wmsProxyValueAddedDetailId = material.wmsValueAddedMaterialId;
    this.services[materialIndex].enable = true;
  };

  // 清空服务
  @action
  public onClickClearButton = () => {
    this.services = this.rootStore().defaultServices;
  };

  // 保存增值服务设置
  @action
  public onOk = async() => {
    const detailData = this.services.map((item) => ({
      valueAddedType: item.valueAddedType,
      material: item.material,
      enable: item.enable,
      wmsValueAddedMaterialId: item.material?.wmsValueAddedMaterialId || item.wmsProxyValueAddedDetailId,
    }));
    const notSelectMaterialServices = detailData.filter((i) => {
      if (i.enable) {
        if (i.valueAddedType === 4 || i.valueAddedType === 8) {
          return !i.material?.wmsValueAddedMaterialId;
        } else if (i.valueAddedType !== 6) {
          return !(i.material && i.wmsValueAddedMaterialId);
        } else {
          return false;
        }
      }
      return false;
    });
    if (notSelectMaterialServices.length > 0) {
      const type = notSelectMaterialServices[0].valueAddedType;
      const name = this.rootStore().defaultServices.find((i) => i.valueAddedType === type)?.valueAddedName;
      message.warning(`请选择${name}物料`);
      return;
    }
    try {
      this.loading = true;
      await request({
        url: '/api/cloud/baseinfo/rest/value/added/external/proxy/platform/goods/config/edit',
        method: 'POST',
        data: {
          businessIdList: this.goodsIds,
          detail: detailData,
        },
      });
      message.success('操作成功');
      this.onClose();
      this.parent.gridModel.onRefresh();
      this.parent.gridModel.resetAll();
    } finally {
      this.loading = false;
    }
  };

  // 改变合格证
  @action
  public onQualifyChange = (qualifyId: string) => {
    const index = this.services.findIndex((item) => item.valueAddedType === 4);

    // @ts-ignore
    this.services[index].material = { wmsValueAddedMaterialId: qualifyId };
  };

  // 改变水洗唛
  @action
  public onWashCardChange = (washCardId: string) => {
    const index = this.services.findIndex((item) => item.valueAddedType === 8);

    // @ts-ignore
    this.services[index].material = { wmsValueAddedMaterialId: washCardId };
  };
}
