import type { InputRef } from 'antd';
import { action, computed, extendObservable, observable } from 'mobx';
import React from 'react';
import { FilterBase } from '../filterBase';
import type { ENUM_SPLIT_SYMBOL } from '../types';
import { ENUM_FILTER_ITEM_TYPE } from '../types';
import { formatValueAndLabelData, trimWhiteSpace } from '../utils';

interface FilterPatternSearchData {
  value: string;
  label: string;
  clearInputValue?: boolean;
  inputFocus?: boolean;
  inputDisabled?: boolean;

  [key: string]: any;
}

export class FilterPatternSearch extends FilterBase {
  constructor(options: Partial<FilterPatternSearch>) {
    super();
    const {
      data,
      ...rest
    } = options;
    extendObservable(this, { ...rest });
    this.data = formatValueAndLabelData(data);

    this.formatValue(this.selectValue == null ? null : `${this.selectValue},${this.inputValue || ''}`);
    this.snapshot = {
      selectValue: this.selectValue,
      inputValue: this.inputValue,
    };
  }

  /**
   * 类型标志
   */
  @observable public type: 'patternSearch' = ENUM_FILTER_ITEM_TYPE.patternSearch;

  /**
   * 重写data相关类型
   */
  @observable public data: FilterPatternSearchData[] = [];

  public toProgramme(): string | null {
    if (this.selectValue == null) {
      return null;
    }

    return `${this.selectValue},${trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace)}`;
  }

  public translateParams(): string[] {
    const item = this.data.find((item) => item.value === this.selectValue);
    if (item) {
      return [
        this.label,
        `${item.label}${trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace)}`,
      ];
    } else {
      return [];
    }
  }

  public toParams(): {[key: string]: string; } {
    if (this.selectValue == null) {
      return {};
    }

    if (this.selectParamsField && this.inputParamsField) {
      const result = {};
      result[this.selectParamsField] = this.selectValue;
      result[this.inputParamsField] = trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace);
      return result;
    } else {
      return { [this.field]: this.toProgramme() };
    }
  }

  private snapshot: { selectValue: string | undefined; inputValue: string; } = {
    selectValue: undefined,
    inputValue: '',
  };

  @action public reset = (): void => {
    this.inputValue = this.snapshot.inputValue;
    this.selectValue = this.snapshot.selectValue;

    if (typeof this.handleSelectChangeCallback === 'function') {
      this.handleSelectChangeCallback(this.selectValue);
    }

    if (typeof this.handleInputChangeCallback === 'function') {
      this.handleInputChangeCallback(trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace));
    }
  };

  /**
   * 选择的值转化为参数的字段
   */
  @observable public selectParamsField = '';

  /**
   * 输入的值转化为参数的字段
   */
  @observable public inputParamsField = '';

  @action
  public formatValue(value?: string): void {
    if (value == null) {
      return;
    }

    const splitValue = (value || '').split(',');
    this.selectValue = splitValue[0];
    this.inputValue = splitValue.slice(1)
      .join(',');
  }

  /**
   * 是否去掉输入框左右空格
   */
  @observable public isTrimWhiteSpace = true;

  /**
   * 输入框的值
   */
  @observable public inputValue = '';

  @action public handleInputChange = (inputValue: string): void => {
    this.inputValue = inputValue;

    if (typeof this.handleInputChangeCallback === 'function') {
      this.handleInputChangeCallback(trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace));
    }

    if (inputValue && !this.selectValue) {
      this.selectValue = this.data[this.autoSetSelectDataIndex]?.value;
    }
  };

  /**
   * 输入值改变回掉
   */
  public handleInputChangeCallback: (value?: string) => any;

  /**
   * 选择的值
   */
  @observable public selectValue: string | undefined = undefined;

  @action public handleSelectValue = (value: undefined | string): void => {
    this.selectValue = this.selectValue === value ? undefined : value;

    if (typeof this.handleSelectChangeCallback === 'function') {
      this.handleSelectChangeCallback(this.selectValue);
    }

    const item = this.data.find((item) => item.value === this.selectValue);
    if (item) {
      if (item.clearInputValue) {
        this.handleInputChange('');
      }

      if (item.inputFocus) {
        // 没法从禁止到直接获取焦点
        setTimeout(() => {
          this.inputRef.current?.focus();
        });
      }
    }
  };

  /**
   * 选择值改变回掉
   */
  public handleSelectChangeCallback: (value?: string | undefined) => any;

  /**
   * 输入框提示文字
   */
  @observable public inputPlaceholder = '请输入';

  @observable.ref public inputRef = React.createRef<InputRef>();

  @computed
  public get inputDisabled(): boolean {
    return this.data.find((item) => item.value === this.selectValue)?.inputDisabled === true;
  }

  /**
   * 是否批量查询
   */
  @observable public isMultipleSearch = false;

  /**
   * 批量查询切分符号
   * 前置条件: isMultipleSearch = true
   */
  @observable public splitSymbol: ENUM_SPLIT_SYMBOL = ',';

  /**
   * 是否可清除
   */
  @observable public allowClear = true;

  /**
   * 当没有选中值且在输入框中输入了值---需要选中包含
   * 但是组件数据都是外部传来的,不知道包含的value,只能通过传递进来的data的index来设置
   */
  @observable public autoSetSelectDataIndex = 0;
}

