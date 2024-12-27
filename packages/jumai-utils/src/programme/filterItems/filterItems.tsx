import { message } from 'antd';
import { action, computed, observable, set } from 'mobx';
import qs from 'qs';
import { filterInstanceFactory } from './filterInstanceFactory';
import type { FilterItem, FilterItemOptions, FilterItemSettingItem, ValueAndLabelData } from './types';
import { ENUM_FILTER_ITEM_TYPE } from './types';
import { formatValueAndLabelData } from './utils';

export function validParams(data: FilterItemOptions[]): never | void {
  data.forEach((item) => {
    if (!(item.type in ENUM_FILTER_ITEM_TYPE)) {
      throw new Error(`当前type: ${item.type}。只支持${Object.values(ENUM_FILTER_ITEM_TYPE)
        .join('或者')}`);
    }

    if (!item.field) {
      throw new Error(`${item.type}的field必须填写`);
    }

    if (!item.label) {
      throw new Error(`${item.field}的label必须填写`);
    }
  });

  if (data.length) {
    const fields = Object.create(null);
    const labels = Object.create(null);

    data.forEach((item) => {
      fields[item.field] = (fields[item.field] >>> 0) + 1;
      labels[item.label] = (labels[item.label] >>> 0) + 1;
    });

    data.forEach((item) => {
      if (fields[item.field] > 1) {
        throw new Error(`field: ${item.field} 重复`);
      }
      if (labels[item.label] > 1) {
        throw new Error(`label: ${item.label} 重复`);
      }
    });
  }
}

function transformUrlQuery(instance: FilterItem, urlParams: {[key: string]: string; }): void {
  if (Object.prototype.hasOwnProperty.call(urlParams, instance.field)) {
    instance.formatValue.call(instance, urlParams[instance.field]);
  }
}

function transformDict(dict: FilterItemsParams['dict'], instance: FilterItem): void {
  if (Object.prototype.hasOwnProperty.call(dict, instance.field)) {
    instance.handleData(dict[instance.field]);
  }
}

function transformDataToInstance(dict: FilterItemsParams['dict'], data: FilterItemOptions[], urlParams: {[key: string]: string; }): FilterItem[] {
  validParams(data);

  return data.map((item) => {
    const instance = filterInstanceFactory(item);

    transformUrlQuery(instance, urlParams);
    transformDict(dict, instance);
    return instance;
  });
}

export interface FilterItemsParams {

  /**
   * 查询项配置
   */
  filterItems?: FilterItemOptions[];

  /**
   * 字典
   */
  dict?: {[key: string]: ValueAndLabelData; };
}

export interface ConnectListItem {
  toParams: () => {[key: string]: string | string[]; };
  reset?: () => void;
  validator?: () => Promise<string>;
  [key: string]: any;
}

export class FilterItems {
  constructor({
    filterItems = [],
    dict = {},
  }: FilterItemsParams) {
    this.init(filterItems, dict);
  }

  /**
   * 字典数据(查询项的data属性)
   */
  @observable public dict: FilterItemsParams['dict'] = {};

  public initSettingData: FilterItemSettingItem[] = [];

  @action private init = (data: FilterItemOptions[] = [], dict: FilterItemsParams['dict'] = {}): void => {
    for (const key in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        this.dict[key] = formatValueAndLabelData(dict[key]);
      }
    }

    const urlParams = qs.parse(location.search.replace(/^\?/, '')) as {[key: string]: string; };
    this.originData = transformDataToInstance(dict, data, urlParams);
    this.initSettingData = this.originData.filter((item) => !item.isDynamic)
      .map((item) => ({
        field: item.field,
        label: item.label,
        showItem: item.showItem,
      }));
  };

  /**
   * 动态添加查询项。field、label、type必须
   */
  @action public addItem = (data: FilterItemOptions[]): void => {
    transformDataToInstance(this.dict, data, {})
      .forEach((item) => {
        item.isDynamic = true;
        this.originData.push(item);
      });
  };

  /**
   * 动态添加字典数据
   */
  @action public addDict = (dict: FilterItemsParams['dict']): void => {
    for (const key in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        this.dict[key] = formatValueAndLabelData(dict[key]);
      }
    }
    this.originData.forEach((instance) => transformDict(dict, instance));
  };

  /**
   * 重置所有查询项的值为初始的状态
   */
  @action public reset = (): void => {
    this.originData.forEach((item) => item.reset());
    this.connectedList.forEach((item) => {
      if (typeof item.reset === 'function') {
        item.reset();
      }
    });
  };

  /**
   * 更新查询项的值。filed必须、type建议写、其它需要更新的字段
   */
  @action public updateFilterItem = (data: FilterItemOptions[]): void => {
    this.originData.forEach((item) => {
      const addItem = data.find((val) => val.field === item.field);
      if (addItem) {
        set(item, addItem);
      }
    });
  };

  /**
   * 获取某一项查询项
   */
  public getFilterItem(field: string): FilterItem | undefined {
    return this.originData.find((item) => item.field === field);
  }

  /**
   * 原始数据
   */
  @observable public originData: FilterItem[] = [];

  /**
   * 展现数据
   */
  @computed
  public get actualData(): FilterItem[] {
    return this.originData.filter((item) => item.showItem);
  }

  /**
   * 获取查询项的查询参数
   */
  @computed
  public get params(): {[key: string]: any; } {
    const params = this.actualData.reduce((prev, current) => ({
      ...prev,
      ...current.toParams.call(current),
    }), {});

    return this.connectedList.reduce((prev, current) => ({
      ...prev,
      ...current.toParams(),
    }), params);
  }

  /**
   * 获取查询项翻译列表
   */
  @computed
  public get translateParamsList(): string[][] {
    return this.actualData.map((item) => item.translateParams.call(item) as string[])
      .filter((item: string[]) => item.length);
  }

  /**
   * 获取查询项翻译的值
   */
  @computed
  public get translateParams(): string[] {
    return this.translateParamsList.map((item: string[]) => item.join(':'));
  }

  /**
   * 连接的列表
   */
  @observable private connectedList: ConnectListItem[] = [];

  /**
   * 外部model连接到查询项
   */
  @action
  public connect(connectListItem: ConnectListItem): void {
    this.connectedList.push(connectListItem);
  }

  /**
   * 校验查询项(配合查询项的require属性)
   */
  @action public validator = async(): Promise<string> => {
    await Promise.all(this.actualData.map((item) => item.validator()))
      .catch((info: string) => {
        message.warning({
          key: String(info),
          content: String(info),
        });
        throw String(info);
      });

    const connectedList = this.connectedList;
    for (let i = 0; i < connectedList.length; i++) {
      if (connectedList[i].validator) {
        await connectedList[i].validator()
          .catch((info) => {
            message.warning({
              key: String(info),
              content: String(info),
            });
            throw String(info);
          });
      }
    }

    return Promise.resolve('');
  };
}
