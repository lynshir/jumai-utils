import { Popover } from 'antd';
import { action, computed, observable } from 'mobx';
import React from 'react';
import type { BaseData } from 'egenie-common';
import { request } from 'egenie-common';
import type { Programme } from './programme';
import { ProgrammeTranslate } from './programmeTranslate';
import type { SortAndDisplaySettingItem } from './filterItemsSetting/types';
import type { ProgrammeListItem } from './types';

type DisplayItem = SortAndDisplaySettingItem & ProgrammeListItem;

export class ProgrammeListSettingStore {
  constructor(private parent: Programme) {
  }

  @observable public isLoading = false;

  @observable public data: ProgrammeListItem[] = [];

  @computed
  public get displayData(): DisplayItem[] {
    return this.data.map((item) => ({
      primaryKey: `${item.id}`,
      showItem: Boolean(item.displayStatus),
      label: item.schemeName,
      ...item,
    }));
  }

  public renderLabel = (item: DisplayItem): React.ReactNode => {
    return (
      <Popover
        content={(
          <ProgrammeTranslate
            filterItems={this.parent.filterItems}
            schemeValue={item.schemeValue}
          />
        )}
        destroyTooltipOnHide
        placement="bottom"
      >
        <span style={{ cursor: 'pointer' }}>
          {item.label}
        </span>
      </Popover>
    );
  };

  @action public handleSave = (params: SortAndDisplaySettingItem[]) => {
    const data = params.map((item, index) => ({
      id: item.primaryKey,
      displayStatus: item.showItem ? 1 : 0,
      order: index + 1,
    }));

    return request({
      url: '/api/boss/baseinfo/rest/filterSet/update/query/scheme/order',
      method: 'post',
      data,
    })
      .then(() => {
        this.parent.getProgrammeList();
        this.handleClose();
      });
  };

  @observable public showModal = false;

  @action public handleOpen = () => {
    this.isLoading = true;
    request<BaseData<ProgrammeListItem[]>>({
      url: '/api/boss/baseinfo/rest/filterSet/query/scheme/list',
      params: { module: this.parent.moduleName },
    })
      .then((info) => {
        this.data = Array.isArray(info.data) ? info.data : [];
        this.showModal = true;
      })
      .finally(() => this.isLoading = false);
  };

  @action public handleClose = () => {
    this.showModal = false;
    this.data = [];
  };
}
