import { Radio } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FilterItemLabel } from '../utils';
import { ENUM_BOOLEAN_DATA } from './filterBoolean';
import type { FilterBoolean } from './filterBoolean';

@observer
export class FilterBooleanComponent extends React.Component<{ store: FilterBoolean; }> {
  render() {
    const {
      style,
      className,
      handleValueChange,
      value,
      label,
      labelWidth,
      required,
      yesText,
      noText,
    } = this.props.store;
    const data = [
      {
        value: ENUM_BOOLEAN_DATA.yes.value,
        label: yesText,
      },
      {
        value: ENUM_BOOLEAN_DATA.no.value,
        label: noText,
      },
    ];
    return (
      <div
        className={`filterBoolean ${className}`}
        style={toJS(style)}
      >
        <FilterItemLabel
          label={label}
          labelWidth={labelWidth}
          required={required}
        />
        <Radio.Group value={value}>
          {
            data.map((item) => (
              <Radio
                key={item.value}
                onClick={() => handleValueChange(item.value)}
                value={item.value}
              >
                {item.label}
              </Radio>
            ))
          }
        </Radio.Group>
      </div>
    );
  }
}
