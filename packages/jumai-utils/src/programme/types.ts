import type { BaseData } from 'jumai-common';

export interface ProgrammeListItem {
  id: string;
  schemeName: string;
  schemeValue: string;
  displaySetting: string;
  sysSetting: boolean;
  displayStatus: boolean;
  sortOrder: number;
}

export interface FilterSetItem {
  oldSet?: ProgrammeListItem[];
  item_list?: {[key: string]: {[key: string]: string; }; };
  itemList?: {[key: string]: {[key: string]: string; }; };
  dict_list?: {[key: string]: Array<{[key: string]: string; }>; };
  dictList?: {[key: string]: Array<{[key: string]: string; }>; };
}

export type FilterConfigData = BaseData<FilterSetItem>;

export interface FieldSettingItem {
  field: string;
  label: string;
  showItem: boolean;
}
