import type { FilterBoolean } from './filterBoolean/filterBoolean';
import type { FilterCascader } from './filterCascader/filterCascader';
import type { FilterCheckbox } from './filterCheckbox/filterCheckbox';
import type { FilterDate } from './filterDate/filterDate';
import type { FilterDateStartOrEnd } from './filterDate/filterDateStartOrEnd';
import type { FilterInput } from './filterInput/filterInput';
import type { FilterInputAndSelect } from './filterInputAndSelect/filterInputAndSelect';
import type { FilterInputNumberGroup } from './filterInputNumberGroup/filterInputNumberGroup';
import type { FilterInputOrSelect } from './filterInputOrSelect/filterInputOrSelect';
import type { FilterPatternSearch } from './filterPatternSearch/filterPatternSearch';
import type { FilterRadio } from './filterRadio/filterRadio';
import type { FilterSelect } from './filterSelect/filterSelect';
import type { FilterTreeSelect } from './filterTreeSelect/filterTreeSelect';

/**
 * 查询项类型
 */
export enum ENUM_FILTER_ITEM_TYPE {
  input = 'input',
  inputAndSelect = 'inputAndSelect',
  inputNumberGroup = 'inputNumberGroup',
  radio = 'radio',
  select = 'select',
  date = 'date',
  dateRange = 'dateRange',
  dateStart = 'dateStart',
  dateEnd = 'dateEnd',
  checkbox = 'checkbox',
  inputOrSelect = 'inputOrSelect',
  cascader = 'cascader',
  treeSelect = 'treeSelect',
  patternSearch = 'patternSearch',
  boolean = 'boolean',
}

/**
 * 批量查询拆分符号
 */
export type ENUM_SPLIT_SYMBOL = ' ' | ',';

/**
 * 查询项data的统一格式
 */
export type ValueAndLabelData = Array<{ value: string; label: string; [key: string]: any; }>;

/**
 * 查询项种类
 */
export type FilterItem =
  FilterInput
  | FilterInputNumberGroup
  | FilterSelect
  | FilterRadio
  | FilterInputAndSelect
  | FilterDate
  | FilterCheckbox
  | FilterInputOrSelect
  | FilterCascader
  | FilterDateStartOrEnd
  | FilterPatternSearch
  | FilterTreeSelect
  | FilterBoolean;

/**
 * 查询项参数
 */
export type FilterItemOptions = Partial<FilterItem>;

/**
 * 查询项保存类型
 */
export interface FilterItemSettingItem {
  field: string;
  label: string;
  showItem: boolean;
}

/**
 * 日期组件picker类型
 */
export enum ENUM_PICKER_TYPE {
  date = 'date',
  week = 'week',
  month = 'month',
  quarter = 'quarter',
  year = 'year',
}
