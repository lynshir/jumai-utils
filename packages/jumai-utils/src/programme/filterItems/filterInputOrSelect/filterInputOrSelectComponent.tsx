import { Input, Select } from 'antd';
import _ from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { throttleTime } from '../utils';
import type { FilterInputOrSelect } from './filterInputOrSelect';

@observer
export class FilterInputOrSelectComponent extends React.Component<{ store: FilterInputOrSelect; }> {
  public handlePressEnter: React.KeyboardEventHandler = _.throttle((event) => {
    if (!this.props.store._isLoading) {
      if (typeof this.props.store.onPressEnter === 'function') {
        this.props.store.onPressEnter();
      }
    }
  }, throttleTime);

  render() {
    const {
      value,
      handleInputChange,
      placeholder,
      style,
      className,
      data,
      handleSelectChange,
      selectValue,
      allowClear,
      disabled,
      labelWidth,
    } = this.props.store;
    return (
      <div
        className={`filterInputOrSelect ${className}`}
        style={toJS(style)}
      >
        <section>
          <Input
            allowClear={allowClear}
            bordered={false}
            disabled={disabled}
            onChange={handleInputChange}
            onPressEnter={this.handlePressEnter}
            placeholder={placeholder}
            value={value}
          />
          <Select
            allowClear
            bordered={false}
            disabled={disabled}
            dropdownMatchSelectWidth={false}
            getPopupContainer={(nodeItem) => nodeItem.parentElement}
            onChange={handleSelectChange}
            options={data}
            placeholder="请选择"
            style={{
              width: labelWidth,
              maxWidth: labelWidth,
            }}
            value={selectValue}
          />
        </section>
      </div>
    );
  }
}
