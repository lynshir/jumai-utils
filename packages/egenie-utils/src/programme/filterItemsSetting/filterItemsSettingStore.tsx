import type { FilterItem, FilterItems } from '../filterItems';
import { action, computed, observable } from 'mobx';
import type { BaseData } from 'egenie-common';
import { request } from 'egenie-common';
import type { SortAndDisplaySettingItem } from './types';
import type { FieldSettingItem } from '../types';

export class FilterItemsSettingStore {
  constructor(
    private filterItems: FilterItems,
    private filterItemsSettingCacheKey: string,
    private saveCallback?: (data?: FieldSettingItem[]) => any
  ) {
  }

  public get showFilterItemsSetting(): boolean {
    return Boolean(this.filterItemsSettingCacheKey);
  }

  /**
   * 转化originData使符合弹框需要的props
   */
  @computed
  public get originSettingData(): SortAndDisplaySettingItem[] {
    return this.filterItems.originData.map((item) => ({
      primaryKey: item.field,
      label: item.label,
      showItem: item.showItem,
    }));
  }

  /**
   * 转化initSettingData使符合弹框需要的props
   */
  @computed
  public get initSettingData(): SortAndDisplaySettingItem[] {
    return this.filterItems.initSettingData.map((item) => ({
      primaryKey: item.field,
      label: item.label,
      showItem: item.showItem,
    }));
  }

  @action private handleDataChange = (settingData: FieldSettingItem[]) => {
    this.filterItems.updateFilterItem(settingData);

    const settingMatchFields: string[] = settingData.filter((item) => this.filterItems.originData.find((val) => val.field === item.field))
      .map((item) => item.field);
    const settingMatchFilterItems: FilterItem[] = [];
    const restFilterItems: FilterItem[] = [];

    settingMatchFields.forEach((field) => {
      settingMatchFilterItems.push(this.filterItems.originData.find((item) => item.field === field));
    });

    this.filterItems.originData.forEach((item) => {
      if (!settingMatchFields.includes(item.field)) {
        restFilterItems.push(item);
      }
    });

    let i = 0;
    let j = 0;
    while (i < settingMatchFilterItems.length) {
      this.filterItems.originData[i] = settingMatchFilterItems[i];
      i++;
    }

    while (j < restFilterItems.length) {
      this.filterItems.originData[i] = restFilterItems[j];
      i++;
      j++;
    }
  };

  @action public getData = (): void => {
    if (!this.showFilterItemsSetting) {
      return;
    }

    request<BaseData<string>>({
      url: '/api/baseinfo/rest/dashboard/cache/get',
      params: { cacheKey: this.filterItemsSettingCacheKey },
    })
      .then((info) => {
        try {
          const data: FieldSettingItem[] = JSON.parse(info.data);
          if (Array.isArray(data)) {
            this.handleDataChange(data);
          }
        } catch (e) {
          console.log(e);
        }
      });
  };

  @action public handleSave = (params: SortAndDisplaySettingItem[]) => {
    const data: FieldSettingItem[] = params.map((item) => ({
      field: item.primaryKey,
      label: item.label,
      showItem: Boolean(item.showItem),
    }));

    return request({
      url: '/api/baseinfo/rest/dashboard/cache/save',
      method: 'post',
      data: new URLSearchParams(Object.entries({
        cacheKey: this.filterItemsSettingCacheKey,
        cacheValue: JSON.stringify(data),
      })),
    })
      .then(() => {
        this.handleClose();
        this.handleDataChange(data);
        if (typeof this.saveCallback === 'function') {
          this.saveCallback(data);
        }
      });
  };

  @observable public showModal = false;

  @action public handleOpen = () => {
    this.showModal = true;
  };

  @action public handleClose = () => {
    this.showModal = false;
  };
}
