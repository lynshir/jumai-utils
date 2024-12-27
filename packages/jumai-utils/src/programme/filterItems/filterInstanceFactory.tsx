import { FilterBoolean } from './filterBoolean/filterBoolean';
import { FilterCascader } from './filterCascader/filterCascader';
import { FilterCheckbox } from './filterCheckbox/filterCheckbox';
import { FilterDate } from './filterDate/filterDate';
import { FilterDateStartOrEnd } from './filterDate/filterDateStartOrEnd';
import { FilterInput } from './filterInput/filterInput';
import { FilterInputAndSelect } from './filterInputAndSelect/filterInputAndSelect';
import { FilterInputNumberGroup } from './filterInputNumberGroup/filterInputNumberGroup';
import { FilterInputOrSelect } from './filterInputOrSelect/filterInputOrSelect';
import { FilterPatternSearch } from './filterPatternSearch/filterPatternSearch';
import { FilterRadio } from './filterRadio/filterRadio';
import { FilterSelect } from './filterSelect/filterSelect';
import { FilterTreeSelect } from './filterTreeSelect/filterTreeSelect';
import type { FilterItem, FilterItemOptions } from './types';
import { ENUM_FILTER_ITEM_TYPE } from './types';

export function filterInstanceFactory(item: FilterItemOptions): FilterItem {
  switch (item.type) {
    case ENUM_FILTER_ITEM_TYPE.input:
      return new FilterInput(item);
    case ENUM_FILTER_ITEM_TYPE.inputNumberGroup:
      return new FilterInputNumberGroup(item);
    case ENUM_FILTER_ITEM_TYPE.select:
      return new FilterSelect(item);
    case ENUM_FILTER_ITEM_TYPE.radio:
      return new FilterRadio(item);
    case ENUM_FILTER_ITEM_TYPE.inputAndSelect:
      return new FilterInputAndSelect(item);
    case ENUM_FILTER_ITEM_TYPE.date:
    case ENUM_FILTER_ITEM_TYPE.dateRange:
      return new FilterDate(item);
    case ENUM_FILTER_ITEM_TYPE.dateStart:
    case ENUM_FILTER_ITEM_TYPE.dateEnd:
      return new FilterDateStartOrEnd(item);
    case ENUM_FILTER_ITEM_TYPE.checkbox:
      return new FilterCheckbox(item);
    case ENUM_FILTER_ITEM_TYPE.inputOrSelect:
      return new FilterInputOrSelect(item);
    case ENUM_FILTER_ITEM_TYPE.cascader:
      return new FilterCascader(item);
    case ENUM_FILTER_ITEM_TYPE.treeSelect:
      return new FilterTreeSelect(item);
    case ENUM_FILTER_ITEM_TYPE.patternSearch:
      return new FilterPatternSearch(item);
    case ENUM_FILTER_ITEM_TYPE.boolean:
      return new FilterBoolean(item);
  }

  throw new Error('查询组件type不对');
}
