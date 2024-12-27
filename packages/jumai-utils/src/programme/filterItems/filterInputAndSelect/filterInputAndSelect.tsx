import type { InputRef } from 'antd';
import _ from 'lodash';
import { action, computed, extendObservable, observable } from 'mobx';
import React from 'react';
import { FilterBase } from '../filterBase';
import type { ENUM_SPLIT_SYMBOL } from '../types';
import { ENUM_FILTER_ITEM_TYPE } from '../types';
import { trimWhiteSpace } from '../utils';

export class FilterInputAndSelect extends FilterBase {
  constructor(options: Partial<FilterInputAndSelect>) {
    super(options);
    const {
      data,
      ...rest
    } = options;

    extendObservable(this, { ...rest });
    this.formatValue(`${_.toString(this.selectValue)},${_.toString(this.inputValue)}`);
    this.snapshot = {
      inputValue: this.inputValue,
      selectValue: this.selectValue,
    };
  }

  /**
   * 类型标志
   */
  @observable public type: 'inputAndSelect' = ENUM_FILTER_ITEM_TYPE.inputAndSelect;

  public toProgramme(): string | null {
    if (this.selectValue) {
      if (trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace)) {
        return `${this.selectValue},${trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace)}`;
      } else {
        return `${this.selectValue}`;
      }
    } else {
      return null;
    }
  }

  public toParams(): {[key: string]: string; } {
    if (this.selectValue) {
      if (trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace)) {
        return { [this.selectValue]: trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace) };
      } else {
        return {};
      }
    } else {
      return {};
    }
  }

  public translateParams(): string[] {
    if (this.selectValue) {
      if (trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace)) {
        return [
          this.data.find((item) => item.value === this.selectValue)?.label || '',
          trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace),
        ];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  private snapshot: { inputValue: string | undefined; selectValue: string; } = {
    inputValue: '',
    selectValue: '',
  };

  @action public reset = (): void => {
    this.inputValue = this.snapshot.inputValue;
    this.selectValue = this.snapshot.selectValue;

    if (typeof this.handleInputChangeCallback === 'function') {
      this.handleInputChangeCallback(trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace));
    }

    if (typeof this.handleSelectChangeCallback === 'function') {
      this.handleSelectChangeCallback(this.selectValue);
    }
  };

  @action
  public formatValue(value?: string): void {
    const keyAndValue = _.toString(value)
      .split(',');
    this.inputValue = trimWhiteSpace(keyAndValue.slice(1).join(','), this.isTrimWhiteSpace);
    this.selectValue = keyAndValue[0] ? keyAndValue[0] : undefined;
  }

  /**
   * 输入框的值
   */
  @observable public inputValue = '';

  @observable.ref public inputRef = React.createRef<InputRef>();

  @action public handleInputChange = (inputValue: string): void => {
    this.inputValue = inputValue;
    if (typeof this.handleInputChangeCallback === 'function') {
      this.handleInputChangeCallback(trimWhiteSpace(this.inputValue, this.isTrimWhiteSpace));
    }
  };

  /**
   * 输入框改变值回掉
   */
  public handleInputChangeCallback: (value?: string) => void;

  /**
   * 下拉框的值
   */
  @observable public selectValue: string | undefined = '';

  @action public handleSelectChange = (selectValue: string | undefined) => {
    this.selectValue = selectValue;
    this.inputRef.current.focus();
    if (typeof this.handleSelectChangeCallback === 'function') {
      this.handleSelectChangeCallback(this.selectValue);
    }
  };

  /**
   * 下拉框改变值回掉
   */
  public handleSelectChangeCallback: (value?: string | undefined) => void;

  /**
   * 输入框提示文字
   */
  @observable public placeholder = '请输入';

  /**
   * 是否可以清除
   */
  @observable public allowClear = false;

  /**
   * 禁止状态
   */
  @observable public disabled = false;

  /**
   * 是否去掉输入框左右空格
   */
  @observable public isTrimWhiteSpace = true;

  @computed public get isMultipleSearch(): boolean {
    return Boolean(this.data.find((item) => item.value === this.selectValue)?.isMultipleSearch === true);
  }

  /**
   * 批量查询切分符号
   * 前置条件: isMultipleSearch = true
   */
  @observable public splitSymbol: ENUM_SPLIT_SYMBOL = ',';
}

