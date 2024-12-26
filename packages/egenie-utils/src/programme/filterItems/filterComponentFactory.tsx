import React from 'react';
import { FilterBooleanComponent } from './filterBoolean/filterBooleanComponent';
import { FilterCascaderComponent } from './filterCascader/filterCascaderComponent';
import { FilterCheckboxComponent } from './filterCheckbox/filterCheckboxComponent';
import { FilterDateComponent } from './filterDate/filterDateComponent';
import { FilterDateStartOrEndComponent } from './filterDate/filterDateStartOrEndComponent';
import { FilterInputComponent } from './filterInput/filterInputComponent';
import { FilterInputAndSelectComponent } from './filterInputAndSelect/filterInputAndSelectComponent';
import { FilterInputNumberGroupComponent } from './filterInputNumberGroup/filterInputNumberGroupComponent';
import { FilterInputOrSelectComponent } from './filterInputOrSelect/filterInputOrSelectComponent';
import { FilterPatternSearchComponent } from './filterPatternSearch/filterPatternSearchComponent';
import { FilterRadioComponent } from './filterRadio/filterRadioComponent';
import { FilterSelectComponent } from './filterSelect/filterSelectComponent';
import { FilterTreeSelectComponent } from './filterTreeSelect/filterTreeSelectComponent';
import type { FilterItem } from './types';
import { ENUM_FILTER_ITEM_TYPE } from './types';

export function filterComponentFactory(item: FilterItem): React.ReactNode {
  switch (item.type) {
    case ENUM_FILTER_ITEM_TYPE.input:
      return (
        <FilterInputComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.inputNumberGroup:
      return (
        <FilterInputNumberGroupComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.select:
      return (
        <FilterSelectComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.radio:
      return (
        <FilterRadioComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.inputAndSelect:
      return (
        <FilterInputAndSelectComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.date:
    case ENUM_FILTER_ITEM_TYPE.dateRange:
      return (
        <FilterDateComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.dateStart:
    case ENUM_FILTER_ITEM_TYPE.dateEnd:
      return (
        <FilterDateStartOrEndComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.checkbox:
      return (
        <FilterCheckboxComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.inputOrSelect:
      return (
        <FilterInputOrSelectComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.cascader:
      return (
        <FilterCascaderComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.treeSelect:
      return (
        <FilterTreeSelectComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.patternSearch:
      return (
        <FilterPatternSearchComponent
          key={item.field}
          store={item}
        />
      );
    case ENUM_FILTER_ITEM_TYPE.boolean:
      return (
        <FilterBooleanComponent
          key={item.field}
          store={item}
        />
      );
    default:
      return null;
  }
}
