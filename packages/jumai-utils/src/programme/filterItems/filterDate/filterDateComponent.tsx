import { DatePicker, Row, Select, Tag } from 'antd';
import classNames from 'classnames';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import React from 'react';
import styles from '../filterItems.module.less';
import { ENUM_FILTER_ITEM_TYPE } from '../types';
import { FilterItemLabel } from '../utils';
import { FormatDateType } from './filterDate';
import type { FilterDate } from './filterDate';

@observer
export class FilterDateComponent extends React.Component<{ store: FilterDate; }> {
  render() {
    if (this.props.store.type === ENUM_FILTER_ITEM_TYPE.date) {
      return <FilterDateNormal store={this.props.store}/>;
    } else {
      return <FilterDateRange store={this.props.store}/>;
    }
  }
}

@observer
class FilterDateNormal extends React.Component<{ store: FilterDate; }> {
  public disableStartDate = (current: moment.Moment): boolean => {
    const { endTime } = this.props.store;
    if (endTime) {
      if (current) {
        return new Date(current.format(FormatDateType.defaultFormat)).valueOf() >= new Date(endTime.format(FormatDateType.defaultFormat)).valueOf();
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  public disableEndDate = (current: moment.Moment): boolean => {
    const { startTime } = this.props.store;
    if (startTime) {
      if (current) {
        return new Date(current.format(FormatDateType.defaultFormat)).valueOf() <= new Date(startTime.format(FormatDateType.defaultFormat)).valueOf();
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  render() {
    const {
      startTime,
      endTime,
      handleStartChange,
      handleEndChange,
      placeholder,
      format,
      handleSelectChange,
      data,
      selectValue,
      label,
      className,
      style,
      disabled,
      labelWidth,
      allowClear,
      required,
      open,
      containerRef,
      fixPanelHideNotSetTime,
    } = this.props.store;
    const newClassName = classNames('filterDateSelect', className);
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
          <Select
            bordered={false}
            dropdownMatchSelectWidth={false}
            getPopupContainer={(nodeItem) => nodeItem.parentElement}
            onChange={handleSelectChange}
            options={data}
            placeholder="请选择"
            style={{ width: `calc(100% - ${labelWidth}px)` }}
            value={selectValue}
          />
        </header>
        <section>
          <DatePicker
            allowClear={open[0] ? false : allowClear}
            bordered={false}
            disabled={disabled[0]}
            disabledDate={this.disableStartDate}
            format={format}
            onChange={handleStartChange}
            onOpenChange={(isOpen: boolean) => {
              fixPanelHideNotSetTime(isOpen);
              this.props.store.open[0] = isOpen;
            }}
            open={open[0]}
            placeholder={Array.isArray(placeholder) ? placeholder[0] : placeholder}
            popupClassName={styles.dropdownDate}
            renderExtraFooter={() => <FilterDateDictComponent store={this.props.store}/>}
            showNow={format === FormatDateType.defaultFormat}
            showTime={format === FormatDateType.defaultFormat ? {
              hideDisabledOptions: true,
              defaultValue: moment('00:00:00', 'HH:mm:ss'),
            } : false}
            showToday={false}
            suffixIcon={null}
            value={startTime}
          />
          <div>
            至
          </div>
          <DatePicker
            allowClear={open[1] ? false : allowClear}
            bordered={false}
            disabled={disabled[1]}
            disabledDate={this.disableEndDate}
            format={format}
            onChange={handleEndChange}
            onOpenChange={(isOpen: boolean) => {
              fixPanelHideNotSetTime(isOpen);
              this.props.store.open[1] = Boolean(isOpen);
            }}
            open={open[1]}
            placeholder={Array.isArray(placeholder) ? placeholder[1] : placeholder}
            popupClassName={styles.dropdownDate}
            renderExtraFooter={() => <FilterDateDictComponent store={this.props.store}/>}
            showNow={format === FormatDateType.defaultFormat}
            showTime={format === FormatDateType.defaultFormat ? {
              hideDisabledOptions: true,
              defaultValue: moment('23:59:59', 'HH:mm:ss'),
            } : false}
            showToday={false}
            value={endTime}
          />
        </section>
      </div>
    );
  }
}

@observer
class FilterDateRange extends React.Component<{ store: FilterDate; }> {
  render() {
    const {
      allowEmpty,
      startTime,
      endTime,
      placeholder,
      format,
      label,
      className,
      style,
      disabled,
      handleRangeChange,
      labelWidth,
      allowClear,
      required,
      open,
      containerRef,
      fixPanelHideNotSetTime,
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
          <DatePicker.RangePicker
            allowClear={open[0] ? false : allowClear}
            allowEmpty={allowEmpty}
            bordered={false}
            disabled={disabled}
            format={format}
            onChange={handleRangeChange}
            onOpenChange={(isOpen: boolean) => {
              fixPanelHideNotSetTime(isOpen);
              this.props.store.open = [
                Boolean(isOpen),
                Boolean(isOpen),
              ];
            }}
            open={open[0]}
            placeholder={placeholder}
            popupClassName={styles.dropdownDate}
            renderExtraFooter={() => <FilterDateDictComponent store={this.props.store}/>}
            showTime={format === FormatDateType.defaultFormat ? {
              hideDisabledOptions: true,
              defaultValue: [
                moment('00:00:00', 'HH:mm:ss'),
                moment('23:59:59', 'HH:mm:ss'),
              ],
            } : false}
            value={[
              startTime,
              endTime,
            ]}
          />
        </section>
      </div>
    );
  }
}

@observer
class FilterDateDictComponent extends React.Component<{ store: FilterDate; }> {
  render() {
    const {
      handleDateDictChange,
      realDateDict,
    } = this.props.store;
    return (
      <Row
        className={styles.dateSelect}
        gutter={[
          4,
          4,
        ]}
      >
        {realDateDict.map((item) => (
          <Tag
            className="egenie-secondary-content"
            color="blue"
            key={item.value}
            onClick={() => handleDateDictChange(item.value)}
          >
            {item.label}
          </Tag>
        ))}
      </Row>
    );
  }
}
