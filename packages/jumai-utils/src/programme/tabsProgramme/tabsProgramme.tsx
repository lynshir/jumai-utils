import { action, observable, computed } from 'mobx';
import { thousandthSeparator } from 'jumai-common';
import type { TabsProgrammeParams } from './types';
import type React from 'react';

interface TabsItemData {
  key: string;
  label: string;
  count?: number;
}

export class TabsProgramme {
  public static renderTabsLabel = function(item: TabsItemData): React.ReactNode {
    return item.count != null ? `${item.label}(${thousandthSeparator(item.count)})` : item.label;
  };

  constructor(params: TabsProgrammeParams) {
    this.activeKey = params.activeKey;
    this.tabsToParams = params.tabsToParams;
    this.normalProgramme = params.normalProgramme;
    this.data = Array.isArray(params.data) ? params.data : [];
    this.activeKeyChangeCallback = params.activeKeyChangeCallback;

    this.normalProgramme.filterItems.connect(this);
  }

  private readonly tabsToParams: TabsProgrammeParams['tabsToParams'];

  private readonly activeKeyChangeCallback: TabsProgrammeParams['activeKeyChangeCallback'];

  public normalProgramme: TabsProgrammeParams['normalProgramme'];

  @computed
  public get tabsData(): TabsItemData[] {
    return this.data.map((item) => ({
      key: item.value,
      label: item.label,
      count: this.countMap[item.value],
    }));
  }

  @observable public countMap: Record<string, number> = {};

  @action public setCountMap = (data?: Record<string, number>): void => {
    this.countMap = {
      ...this.countMap,
      ...data,
    };
  };

  @observable public data: TabsProgrammeParams['data'] = [];

  @action public setData = (data: TabsProgrammeParams['data']): void => {
    this.data = data == null ? [] : data;
  };

  @observable public activeKey: string;

  @action public handleActiveKeyChange = (activeKey: string) => {
    this.activeKey = activeKey;
    if (typeof this.activeKeyChangeCallback === 'function') {
      this.activeKeyChangeCallback(activeKey);
    }
  };

  public toParams = (): Record<string, string> => {
    if (typeof this.tabsToParams === 'string') {
      return { [this.tabsToParams]: this.activeKey };
    } else if (typeof this.tabsToParams === 'function') {
      return this.tabsToParams(this.activeKey);
    } else {
      return {};
    }
  };
}
