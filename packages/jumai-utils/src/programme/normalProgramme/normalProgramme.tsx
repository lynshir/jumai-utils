import { action, computed, observable } from 'mobx';
import type React from 'react';
import { FormatDateType } from '../filterItems/filterDate/filterDate';
import type { FilterItemsParams, FilterItem } from '../filterItems';
import { FilterItems, ENUM_FILTER_ITEM_TYPE } from '../filterItems';
import { NORMAL_PROGRAMME_FILTER_ITEMS_SETTING_PREFIX } from '../constants';
import { FilterItemsSettingStore } from '../filterItemsSetting/filterItemsSettingStore';

interface FilterItemTransformItem {
  filterItem: FilterItem;

  /**
   * 某项所占位置多少个
   */
  itemCount: number;
}

export interface NormalProgrammeParams extends FilterItemsParams {

  /**
   * 回车、查询回调
   */
  handleSearch?: (...args: any) => Promise<any>;

  /**
   * 一行显示个数
   */
  count?: number;

  /**
   * 自定义的button。会覆盖默认的重置、查询
   */
  button?: React.ReactNode;

  /**
   * 是否显示button
   */
  showButton?: boolean;

  /**
   * 是否显示折叠
   */
  showCollapse?: boolean;

  /**
   * 查询方案标识(目前用来查询条件的顺序和显隐)
   */
  moduleName?: string;
}

export class NormalProgramme {
  constructor(options: Partial<NormalProgrammeParams> = {}) {
    this.filterItems = new FilterItems({
      filterItems: (options.filterItems || []).map((item) => ({
        onPressEnter: this.handleSearch,
        ...item,
      })),
      dict: options.dict,
    });
    let filterItemsSettingCacheKey = '';
    this.searchCallback = options.handleSearch;

    if (options.count) {
      this.count = options.count >>> 0;
    }

    if (options.button) {
      this.button = options.button;
    }

    if (options.showButton != null) {
      this.showButton = options.showButton;
    }

    if (options.showCollapse != null) {
      this.showCollapse = Boolean(options.showCollapse);
    }

    if (options.moduleName) {
      this.moduleName = options.moduleName;
      filterItemsSettingCacheKey = `${NORMAL_PROGRAMME_FILTER_ITEMS_SETTING_PREFIX}${options.moduleName}`;
    }

    this.filterItemsSettingStore = new FilterItemsSettingStore(this.filterItems, filterItemsSettingCacheKey, this.handleSearch);
    this.filterItemsSettingStore.getData();
  }

  public filterItemsSettingStore: FilterItemsSettingStore;

  private moduleName = '';

  private searchCallback: NormalProgrammeParams['handleSearch'];

  @observable public showCollapse = true;

  @observable public isSearch = false;

  @action public handleSearch = () => {
    this.isSearch = true;

    this.filterItems.validator()
      .then(() => {
        // 设置所有查询项的loading状态
        this.filterItems.originData.forEach((item) => {
          item._isLoading = true;
        });

        if (typeof this.searchCallback === 'function') {
          try {
            return this.searchCallback();
          } catch (error) {
            console.log('error:筛选组件 handleSearch', error);
            return Promise.reject();
          }
        } else {
          return Promise.resolve();
        }
      })
      .finally(() => {
        this.isSearch = false;

        // 重置所有查询项的loading状态
        this.filterItems.originData.forEach((item) => {
          item._isLoading = false;
        });
      });
  };

  /**
   * 查询项instance
   */
  public filterItems: FilterItems;

  @observable public count = 4;

  /**
   * 自定义的button。会覆盖默认的重置、查询
   */
  public button: NormalProgrammeParams['button'] = null;

  @observable public showButton = true;

  @action public reset = () => {
    this.filterItems.reset();
  };

  @computed
  public get notCollapseData(): FilterItemTransformItem[] {
    // 不折叠的原路返回,兼容可能是竖直方向一个一行
    if (!this.showCollapse) {
      return this.filterItems.actualData.map((item) => ({
        filterItem: item,
        itemCount: 1,
      }));
    }

    let notIncludedBtnCount = 2 * this.count - 1;
    const result: FilterItemTransformItem[] = [];

    for (let i = 0; i < this.filterItems.actualData.length && notIncludedBtnCount > 0; i++) {
      const item = this.filterItems.actualData[i];
      const isDateComponentNeedDoubleCount = (item.type === ENUM_FILTER_ITEM_TYPE.date || item.type === ENUM_FILTER_ITEM_TYPE.dateRange) &&
        item.format === FormatDateType.defaultFormat &&
        this.count >= 6;

      if (isDateComponentNeedDoubleCount) {
        if (notIncludedBtnCount >= 2) {
          result.push({
            filterItem: item,
            itemCount: 2,
          });
        }
        notIncludedBtnCount -= 2;
      } else {
        if (notIncludedBtnCount >= 1) {
          result.push({
            filterItem: item,
            itemCount: 1,
          });
        }
        notIncludedBtnCount--;
      }
    }

    return result;
  }

  @computed
  public get notCollapseActualBtnCount(): number {
    const notCollapseActualTotalCount = this.notCollapseData.reduce((prev, current) => prev + current.itemCount, 0);
    return this.count - (notCollapseActualTotalCount % this.count);
  }

  @computed
  public get collapseData(): FilterItemTransformItem[] {
    const notCollapseFields = this.notCollapseData.map((item) => item.filterItem.field);
    return this.filterItems.actualData.filter((item) => !notCollapseFields.includes(item.field))
      .map((filterItem) => ({
        filterItem,
        itemCount: 1,
      }));
  }
}

