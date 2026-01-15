import { Input } from 'antd';
import _ from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { MultipleSearch } from '../multipleSearch';
import { FilterItemLabel, throttleTime } from '../utils';
import type { FilterInput } from './filterInput';

@observer
export class FilterInputComponent extends React.Component<{ store: FilterInput; }> {
  public handlePressEnter: React.KeyboardEventHandler = _.throttle((event) => {
    if (!this.props.store._isLoading) {
      if (typeof this.props.store.onPressEnter === 'function' && event.key === 'Enter') {
        this.props.store.onPressEnter();
      }
    }
  }, throttleTime);

  render() {
    const {
      value,
      onChange,
      placeholder,
      allowClear,
      disabled,
      style,
      className,
      label,
      labelWidth,
      required,
      isMultipleSearch,
      splitSymbol,
    } = this.props.store;
    return (
      <div
        className={`filterInput ${className}`}
        style={toJS(style)}
      >
        <FilterItemLabel
          label={label}
          labelWidth={labelWidth}
          required={required}
        />
        <Input
          allowClear={allowClear}
          bordered={false}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyUp={this.handlePressEnter}
          placeholder={placeholder}
          suffix={isMultipleSearch ? (
            <MultipleSearch
              callback={onChange}
              splitSymbol={splitSymbol}
              value={value}
            />
          ) : null}
          value={value}
        />
      </div>
    );
  }
}
