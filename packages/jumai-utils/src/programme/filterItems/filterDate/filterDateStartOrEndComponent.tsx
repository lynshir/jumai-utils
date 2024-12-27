import { DatePicker } from 'antd';
import classNames from 'classnames';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import React from 'react';
import { ENUM_FILTER_ITEM_TYPE } from '../types';
import { FilterItemLabel } from '../utils';
import { FormatDateType } from './filterDate';
import type { FilterDateStartOrEnd } from './filterDateStartOrEnd';

@observer
export class FilterDateStartOrEndComponent extends React.Component<{ store: FilterDateStartOrEnd; }> {
  render() {
    const {
      value,
      handleChange,
      placeholder,
      format,
      label,
      className,
      style,
      disabled,
      type,
      labelWidth,
      allowClear,
      required,
      containerRef,
      fixPanelHideNotSetTime,
      picker,
      disabledDate,
      disabledTime,
    } = this.props.store;
    const newClassName = classNames('filterDateNormal', className);
    return (
      <div
        className={newClassName}
        ref={containerRef}
        style={toJS(style)}
      >
        <header>
          <FilterItemLabel
            label={label}
            labelWidth={labelWidth}
            required={required}
          />
        </header>
        <section>
          <DatePicker
            allowClear={allowClear}
            bordered={false}
            disabled={disabled}
            disabledDate={disabledDate}
            disabledTime={disabledTime}
            format={format}
            onChange={handleChange}
            onOpenChange={fixPanelHideNotSetTime}
            picker={picker}
            placeholder={placeholder}
            showNow={false}
            showTime={format === FormatDateType.defaultFormat ? {
              hideDisabledOptions: true,
              defaultValue: type === ENUM_FILTER_ITEM_TYPE.dateStart ? moment('00:00:00', 'HH:mm:ss') : moment('23:59:59', 'HH:mm:ss'),
            } : false}
            showToday={false}
            value={value}
          />
        </section>
      </div>
    );
  }
}
