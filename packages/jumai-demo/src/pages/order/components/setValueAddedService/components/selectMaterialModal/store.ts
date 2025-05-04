import { observable, action, computed } from 'mobx';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { message } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { Material } from '../../interface';

export default class SelectMaterialStore {
  @observable public visible = false;

  @observable public loading = false;

  @observable public materialType = 0;

  @observable public materialList: Material[] = [];

  @observable public selectedMaterial: string = null;

  private onOkCallback: (material: Material) => void = null;

  @computed public get modalTitle() {
    let title = '';
    switch (this.materialType) {
      case 1:
        title = '选择吊牌';
        break;
      case 3:
        title = '选择包装';
        break;
      case 5:
        title = '选择好评卡';
        break;
      case 9:
        title = '换领标';
        break;
      default:
        title = '';
        break;
    }
    return title;
  }

  @action
  public onOpen = (materialType: number, onOkCallback: (material: Material) => void) => {
    this.visible = true;
    this.materialType = materialType;
    this.onOkCallback = onOkCallback;
    this.getMaterialList();
  };

  // 获取物料
  @action
  public getMaterialList = async() => {
    try {
      this.loading = true;
      const { data } = await request<BaseData<Material[]>>({
        url: '/api/cloud/baseinfo/rest/value/added/material/external/bind/query',
        method: 'POST',
        data: { materialType: this.materialType },
      });
      this.materialList = data;
    } finally {
      this.loading = false;
    }
  };

  @action
  public onClose = () => {
    this.visible = false;
    this.materialType = 0;
    this.materialList = [];
    this.selectedMaterial = null;
  };

  @action
  public onSelectedMaterialChange = (e: RadioChangeEvent) => {
    this.selectedMaterial = e.target.value;
  };

  @action
  public onOk = () => {
    if (!this.selectedMaterial) {
      message.warning('请选择物料');
      return;
    }
    const selectedMaterial = this.materialList.find((i) => i.wmsValueAddedMaterialId === this.selectedMaterial);
    this.onOkCallback?.(selectedMaterial);
    this.onClose();
  };
}
