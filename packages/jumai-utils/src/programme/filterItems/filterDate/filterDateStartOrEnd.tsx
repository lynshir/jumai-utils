import { action, observable, extendObservable } from 'mobx';
import moment from 'moment';
import React from 'react';
import { FilterBase } from '../filterBase';
import { ENUM_FILTER_ITEM_TYPE, ENUM_PICKER_TYPE } from '../types';
import { FormatDateType } from './filterDate';
import type { DatePickerProps } from 'antd';

export function formatTime(type: FilterDateStartOrEnd['type'], value: moment.Moment | null, format: string, formatParams: string): string {
  if (!value || !value.isValid()) {
    return '';
  }

  if (type === ENUM_FILTER_ITEM_TYPE.dateStart) {
    if (format === FormatDateType.defaultFormat) {
      return value.format(formatParams);
    } else {
      return value.startOf('day')
        .format(formatParams);
    }
  } else {
    if (format === FormatDateType.defaultFormat) {
      return value.format(formatParams);
    } else {
      return value.endOf('day')
        .format(formatParams);
    }
  }
}

/**
 * 选择开始时间或者结束时间
 */
export class FilterDateStartOrEnd extends FilterBase {
  constructor(options: Partial<FilterDateStartOrEnd>) {
    super(options);
    const {
      data,
      ...rest
    } = options;

    extendObservable(this, { ...rest });
    this.initFormat();
    this.formatValue(this.value);
    this.snapshot = this.value;

    if (!this.placeholder) {
      if (this.type === ENUM_FILTER_ITEM_TYPE.dateStart) {
        this.placeholder = '开始时间';
      } else {
        this.placeholder = '结束时间';
      }
    }
  }

  private initFormat = (): void => {
    if (this.picker !== ENUM_PICKER_TYPE.date) {
      this.format = undefined;
    }
  };

  /**
   * DatePicker.picker
   */
  @observable public picker: DatePickerProps['picker'] = ENUM_PICKER_TYPE.date;

  /**
   * 类型标志。dateStart为选择开始时间。dateEnd为选择结束时间
   */
  @observable public type: 'dateStart' | 'dateEnd' = ENUM_FILTER_ITEM_TYPE.dateStart;

  public toProgramme(): string | null {
    if (formatTime(this.type, this.value, this.format, this.formatParams)) {
      return formatTime(this.type, this.value, this.format, this.formatParams);
    } else {
      return null;
    }
  }

  public toParams(): {[key: string]: string; } {
    if (this.toProgramme()) {
      return { [this.field]: this.toProgramme() };
    } else {
      return {};
    }
  }

  public translateParams(): string[] {
    if (this.toProgramme()) {
      return [
        this.label,
        this.toProgramme(),
      ];
    } else {
      return [];
    }
  }

  @action
  public formatValue(value?: string | moment.Moment | null): void {
    if (!value) {
      this.value = null;
    } else if (typeof value === 'string') {
      this.value = moment(value);
    } else {
      this.value = value;
    }
  }

  private snapshot: moment.Moment = null;

  @action private handleCallback = () => {
    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback(this.value);
    }
  };

  @action public reset = (): void => {
    this.value = this.snapshot;
    this.handleCallback();
  };

  /**
   * 日期改变回掉
   */
  public handleChangeCallback: (value: moment.Moment | null) => void;

  /**
   * 是否允许清除
   */
  @observable public allowClear = true;

  /**
   * 日期展示格式
   */
  @observable public format: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD' | undefined = FormatDateType.defaultFormat;

  /**
   * 日期转化成参数格式
   */
  @observable public formatParams: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD' = FormatDateType.defaultFormat;

  /**
   * 时间
   */
  @observable.ref public value: moment.Moment | null = null;

  @action public handleChange = (value: moment.Moment | null) => {
    this.value = value;
    this.handleCallback();
  };

  /**
   * 禁止状态
   */
  @observable public disabled = false;

  /**
   * 输入框提示文字
   */
  @observable public placeholder = '';

  @observable public containerRef = React.createRef<HTMLDivElement>();

  @action public fixPanelHideNotSetTime = (isOpen: boolean): void => {
    const containerRef = this.containerRef;
    const placeholder = this.placeholder;
    if (this.format === FormatDateType.defaultFormat && !isOpen && containerRef.current) {
      const element: HTMLInputElement = containerRef.current.querySelector(`.ant-picker input[placeholder=${placeholder}]`);
      const value = element?.value;
      if (value) {
        this.value = moment(value);
      }
    }
  };

  /**
   * 不可选择的日期,参考antd
   */
  public disabledDate?: DatePickerProps['disabledDate'] = null;

  /**
   * 不可选择的时间,参考antd
   */
  public disabledTime?: () => any = null;
}
