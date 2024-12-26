import { message, Modal } from 'antd';
import type { FilterItemsParams } from './filterItems';
import { FilterItems } from './filterItems';
import { action, observable } from 'mobx';
import React from 'react';
import type { MainSubStructureModel } from '../egGrid';
import { request, destroyAllModal, renderModal } from 'egenie-common';
import { DEFAULT_PROGRAMME, PROGRAMME_FILTER_ITEMS_SETTING_PREFIX } from './constants';
import { formatFilterConfigData } from './formatFilterConfigData';
import { ProgrammeCountStore } from './programmeCountStore';
import { FilterItemsSettingStore } from './filterItemsSetting/filterItemsSettingStore';
import { ProgrammeInteractiveStore } from './programmeInteractiveStore';
import { ProgrammeListSettingStore } from './programmeListSettingStore';
import type { FilterConfigData, ProgrammeListItem } from './types';
import { AddProgrammeModal } from './addProgrammeModal';
import _ from 'lodash';

export interface ProgrammeParams extends FilterItemsParams {

  /**
   * 查询方案标识。必须传入、否则报错
   */
  moduleName: string;

  /**
   * 字典列表。需要和后端确认。字典需要从方案配置接口获取就传入、不需要就不传入(云仓不要传了)
   */
  dictList?: string;

  /**
   * 类似字典列表(云仓不要传了)
   */
  itemList?: string;

  /**
   * 字段的映射。后端的字典列表---> filterItems字段。返回的key和item的field不一致需要传入对应映射
   */
  fieldMap?: {[key: string]: string | string[]; };

  /**
   * 表格配置
   */
  gridModel?: MainSubStructureModel;

  /**
   * 查询方案数字角标
   */
  showProgrammeCount?: boolean;

  /**
   * 右侧表格自定义渲染,至少完成一个查询
   */
  customTableRender?: {
    onQuery: (...args: any[]) => Promise<any>;
  };
}

export class Programme {
  constructor(options: ProgrammeParams) {
    if (!options.moduleName) {
      throw new Error('moduleName必须传入');
    }
    this.moduleName = options.moduleName;
    this.programmeCountStore.setShowProgrammeCount(Boolean(options.showProgrammeCount));
    this.programmeCountStore.getProgrammeCount();

    this.customTableRender = options.customTableRender;

    this.programmeInteractiveStore = new ProgrammeInteractiveStore(this);

    // filterItems
    this.filterItems = new FilterItems({
      filterItems: (options.filterItems || []).map((item) => ({
        ...item,
        onPressEnter: this.handleSearch,
      })),
      dict: options.dict,
    });

    // 查询条件
    this.filterItemsSettingStore = new FilterItemsSettingStore(this.filterItems, `${PROGRAMME_FILTER_ITEMS_SETTING_PREFIX}${this.moduleName}`, this.handleSearch);
    this.filterItemsSettingStore.getData();

    if (_.isEmpty(this.customTableRender)) {
      // gridModel
      this.gridModel = options.gridModel;
      this.gridModel.getFilterParams = () => this.filterItems.params;
    }

    this.getProgrammeList(options.dictList, options.itemList, options.fieldMap);
  }

  public customTableRender: ProgrammeParams['customTableRender'];

  public filterItems: FilterItems;

  public gridModel: MainSubStructureModel;

  public moduleName: string;

  @observable public programmeList: ProgrammeListItem[] = [];

  @observable public isSearch = false;

  public filterItemsSettingStore: FilterItemsSettingStore;

  public programmeListSettingStore: ProgrammeListSettingStore = new ProgrammeListSettingStore(this);

  public programmeCountStore: ProgrammeCountStore = new ProgrammeCountStore(this);

  public programmeInteractiveStore: ProgrammeInteractiveStore;

  @observable public activeProgrammeId = DEFAULT_PROGRAMME.id;

  @action public getProgrammeList = (dictList = '', itemList = '', fieldMap = {}): void => {
    request<FilterConfigData>({
      url: '/api/boss/baseinfo/rest/filterSet/config',
      method: 'post',
      data: {
        module: this.moduleName,
        dictList,
        itemList,
      },
    })
      .then((info) => {
        this.programmeList = info?.data?.oldSet || [];

        if (this.programmeList.find((item) => `${item.id}` === `${this.activeProgrammeId}`)) {
          this.activeProgrammeId = DEFAULT_PROGRAMME.id;
        }

        const list = formatFilterConfigData(info, fieldMap);
        this.filterItems.addDict(list.reduce((prev, current) => ({
          ...prev,
          [current.field]: current.data,
        }), {}));
        this.filterItems.updateFilterItem(list);
      });
  };

  @action public handleCreateProgramme = (): void => {
    renderModal(
      <AddProgrammeModal
        callback={(params): Promise<unknown> => {
          const schemeValue = this.filterItems.actualData.filter((item) => !item.isDynamic)
            .reduce((prev, current) => {
              const currentValue = current.toProgramme();
              if (currentValue != null) {
                prev[current.field] = currentValue;
              }
              return prev;
            }, {});
          return request({
            url: '/api/boss/baseinfo/rest/filterSet/queryScheme/save',
            method: 'post',
            data: {
              displaySetting: JSON.stringify({}),
              module: this.moduleName,
              schemeValue: JSON.stringify(schemeValue),
              schemeName: params.schemeName,
            },
          })
            .then(() => {
              message.success('创建成功');
              this.getProgrammeList();
              destroyAllModal();
            });
        }}
        onCancel={destroyAllModal}
      />
    );
  };

  @action public editProgramme = (): void => {
    const schemeValue = this.filterItems.actualData.filter((item) => !item.isDynamic)
      .reduce((prev, current) => {
        const currentValue = current.toProgramme();
        if (currentValue != null) {
          prev[current.field] = currentValue;
        }
        return prev;
      }, {});

    Modal.confirm({
      content: '确认更新方案吗?',
      onOk: () => request({
        url: '/api/boss/baseinfo/rest/filterSet/queryScheme/save',
        method: 'post',
        data: {
          displaySetting: JSON.stringify({}),
          module: this.moduleName,
          schemeValue: JSON.stringify(schemeValue),
          schemeName: this.programmeList.find((item) => `${item.id}` === this.activeProgrammeId)?.schemeName,
          id: this.activeProgrammeId,
        },
      })
        .then(() => {
          message.success('编辑成功');
          this.getProgrammeList();
        }),
    });
  };

  @action public handleItemClick = (id: string) => {
    this.activeProgrammeId = `${id}`;
    const item = this.programmeList.find((val) => `${val.id}` == id);

    this.filterItems.reset();

    if (item && item.schemeValue) {
      try {
        const schemeValue = JSON.parse(item.schemeValue) || {};
        this.filterItems.originData.forEach((item) => {
          item.formatValue.call(item, item.field in schemeValue ? schemeValue[item.field] : null);
        });
      } catch (e) {
        console.log(e);
      }
    }

    this.handleSearch();
  };

  @action public handleItemDelete = (id: string): void => {
    const item: ProgrammeListItem = this.programmeList.find((item) => `${item.id}` === `${id}`);
    if (item) {
      Modal.confirm({
        content: '确定删除吗?',
        onOk: () => request({
          url: '/api/boss/baseinfo/rest/filterSet/queryScheme/delete',
          method: 'post',
          data: {
            name: item.schemeName,
            module: this.moduleName,
            id: item.id,
          },
        })
          .then(action(() => {
            message.success('删除成功');
            if (this.activeProgrammeId === `${item.id}`) {
              this.activeProgrammeId = DEFAULT_PROGRAMME.id;
              this.filterItems.reset();
              this.handleSearch();
            }
            this.getProgrammeList();
          })),
      });
    }
  };

  @action public handleSearch = () => {
    this.isSearch = true;

    this.filterItems.validator()
      .then(() => {
        // 设置所有查询项的loading状态
        this.filterItems.originData.forEach((item) => {
          // @ts-ignore
          item._isLoading = true;
        });

        try {
          if (_.isEmpty(this.customTableRender)) {
            return this.gridModel.onQuery();
          } else {
            return this.customTableRender.onQuery(this.filterItems.params);
          }
        } catch (error) {
          console.log('error:筛选组件 handleSearch', error);
          return Promise.reject();
        }
      })
      .finally(() => {
        this.isSearch = false;

        // 重置所有查询项的loading状态
        this.filterItems.originData.forEach((item) => {
          // @ts-ignore
          item._isLoading = false;
        });
      });
  };
}

