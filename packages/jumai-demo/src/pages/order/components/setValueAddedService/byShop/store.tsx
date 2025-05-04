import { observable, action, flow } from 'mobx';
import { api } from '../../../../../utils';
import type { BaseData } from 'jumai-common';
import type { Material } from '../interface';
import { request } from 'jumai-common';
import { message } from 'antd';
import type ParentStore from '../store';

export default class ByShop {
  constructor(parent: ParentStore) {
    this.parent = parent;
  }

  public parent: ParentStore;

  @observable public activeShopId = '';
  
  @observable public qualifyId = '';// 选中的合格证

  @observable public washCardId = '';// 选中的水洗唛

  @observable public loading = false;

  @observable public shopConfigServices = [];// 店铺对应的增值服务

  @action public handleMaterialOk = (material: Material) => {
    const materialIndex = this.shopConfigServices.findIndex((item) => item.valueAddedType === material.materialType);
    this.shopConfigServices[materialIndex].material = material;
    this.shopConfigServices[materialIndex].wmsValueAddedMaterialId = material.wmsValueAddedMaterialId;
    this.shopConfigServices[materialIndex].enable = true;
  };

  public init = flow(function* () {
    this.loading = true;

    // 获取店铺增值服务
    try {
      const shopId = this.parent.shopList[0]?.shopId;
      if (shopId) {
        this.activeShopId = shopId;
        const shopConfigRes = yield request<BaseData>({ url: `${api.getShopConfig}${shopId}` });
        this.shopConfigServices = shopConfigRes.data.detail;
        const qualifyItem = this.shopConfigServices.find((item) => item.valueAddedType === 4);
        this.qualifyId = qualifyItem?.material?.wmsValueAddedMaterialId;
        const washCardItem = this.shopConfigServices.find((item) => item.valueAddedType === 8);
        this.washCardId = washCardItem?.material?.wmsValueAddedMaterialId;
      }
    } catch (e) {
      console.log('获取店铺增值服务出错', e);
    }

    this.loading = false;
  });

  public handleShopChange = flow(function* (shopId) {
    if (this.activeShopId !== shopId) {
      this.activeShopId = shopId;
      this.qualifyId = '';
      this.washCardId = '';
      this.loading = true;

      try {
        const shopConfigRes = yield request<BaseData>({ url: `${api.getShopConfig}${shopId}` });
        this.shopConfigServices = shopConfigRes.data.detail;
        const qualifyItem = this.shopConfigServices.find((item) => item.valueAddedType === 4);
        this.qualifyId = qualifyItem?.material?.wmsValueAddedMaterialId;
        const washCardItem = this.shopConfigServices.find((item) => item.valueAddedType === 8);
        this.washCardId = washCardItem?.material?.wmsValueAddedMaterialId;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    }
  });

  // 关闭服务弹窗
  @action public reset = () => {
    this.qualifyId = '';
    this.washCardId = '';
    this.shopConfigServices = [];
  };

  @action public handleServiceEnableChange = (index: number, checked: boolean) => {
    this.shopConfigServices[index].enable = checked;
  };

  // 选择合格证
  @action public handleQualifyChange = (id) => {
    this.qualifyId = id;
    const index = this.shopConfigServices.findIndex((item) => item.valueAddedType === 4);
    if (index !== -1) {
      this.shopConfigServices[index].material = { wmsValueAddedMaterialId: id };
      this.shopConfigServices[index].wmsProxyValueAddedDetailId = id;
      this.shopConfigServices[index].enable = true;
    }
  };

  // 选择水洗唛
  @action public handleWashCardChange = (id) => {
    this.washCardId = id;
    const index = this.shopConfigServices.findIndex((item) => item.valueAddedType === 8);
    if (index !== -1) {
      this.shopConfigServices[index].material = { wmsValueAddedMaterialId: id };
      this.shopConfigServices[index].wmsProxyValueAddedDetailId = id;
      this.shopConfigServices[index].enable = true;
    }
  };

  // 服务弹窗确定设置服务
  public handleSetService = flow(function* () {
    try {
      const detailData = this.shopConfigServices.map((item) => ({
        wmsProxyValueAddedDetailId: item.wmsProxyValueAddedDetailId,
        valueAddedType: item.valueAddedType,
        enable: item.enable,
        wmsValueAddedMaterialId: item.material?.wmsValueAddedMaterialId || item.wmsValueAddedMaterialId,
      }));
      const notSelectMaterialServices = detailData.filter((i) => i.enable && !i.wmsValueAddedMaterialId && i.valueAddedType !== 6);
      if (notSelectMaterialServices.length > 0) {
        const type = notSelectMaterialServices[0].valueAddedType;
        const name = this.parent.defaultServices.find((i) => i.valueAddedType === type)?.valueAddedName;
        message.warning(`请选择${name}物料`);
        return;
      }
      this.loading = true;
      const res = yield request({
        url: api.setService,
        method: 'POST',
        data: {
          businessId: this.activeShopId,
          detail: detailData,
        },
      });
      message.success(res.data || res.info || '设置成功');
    } catch (e) {
      console.log(e);
    } finally {
      this.loading = false;
    }
  });

  // 清空服务
  @action public clearAllService = () => {
    this.qualifyId = '';
    this.washCardId = '';
    this.shopConfigServices = this.shopConfigServices.map((item) => ({
      enable: false,
      operaterId: item.operaterId,
      priceDesc: item.priceDesc,
      tenantId: item.tenantId,
      timestamp: item.timestamp,
      valueAddedName: item.valueAddedName,
      valueAddedType: item.valueAddedType,
      wmsProxyValueAddedDetailId: item.wmsProxyValueAddedDetailId,
    }));
  };

  // 搜索店铺
  public onSearchShop = (value: number) => {
    if (value) {
      this.handleShopChange(value);
      document.querySelector(`#shopId-${value}`)?.scrollIntoView({ behavior: 'smooth' });
    }
  };
}
