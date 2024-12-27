import type { InputRef } from 'antd';
import { action, extendObservable, observable } from 'mobx';
import React from 'react';
import { FilterBase } from '../filterBase';
import { ENUM_FILTER_ITEM_TYPE } from '../types';

export class FilterRadio extends FilterBase {
  constructor(options: Partial<FilterRadio>) {
    super(options);
    const {
      data,
      ...rest
    } = options;
    extendObservable(this, { ...rest });

    this.formatValue(this.inputValue || this.value);
    this.snapshot = {
      value: this.value,
      inputValue: this.inputValue,
    };
  }

  /**
   * 类型标志
   */
  @observable public type: 'radio' = ENUM_FILTER_ITEM_TYPE.radio;

  public toProgramme(): string | null {
    const inputItem = this.data.find((item) => item.showInput);
    if (inputItem) {
      if (this.value == undefined) {
        if (this.inputValue) {
          return this.inputValue;
        } else {
          return null;
        }
      } else {
        if (inputItem.value === this.value && this.inputValue) {
          return this.inputValue;
        } else {
          return this.value;
        }
      }
    } else {
      if (this.value == undefined) {
        return null;
      } else {
        return this.value;
      }
    }
  }

  public translateParams(): string[] {
    const inputItem = this.data.find((item) => item.showInput);
    if (inputItem) {
      if (this.value == undefined) {
        if (this.inputValue) {
          return [
            this.label,
            this.inputValue,
          ];
        } else {
          return [];
        }
      } else {
        if (inputItem.value === this.value && this.inputValue) {
          return [
            this.label,
            this.inputValue,
          ];
        } else {
          return [
            this.label,
            this.data.find((item) => item.value === this.value)?.label || '',
          ];
        }
      }
    } else {
      if (this.value == undefined) {
        return [];
      } else {
        return [
          this.label,
          this.data.find((item) => item.value === this.value)?.label || '',
        ];
      }
    }
  }

  public toParams(): {[key: string]: string; } {
    if (this.toProgramme() == undefined) {
      return {};
    } else {
      return { [this.field]: this.toProgramme() };
    }
  }

  private snapshot: { value: string | undefined; inputValue: string; } = {
    value: undefined,
    inputValue: '',
  };

  @action public reset = (): void => {
    this.inputValue = this.snapshot.inputValue;
    this.value = this.snapshot.value;
    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback(this.inputValue || this.value);
    }
  };

  @action
  public formatValue(value?: string): void {
    const inputItem = this.data.find((item) => item.showInput);
    if (inputItem) {
      const item = this.data.find((item) => item.value === value);
      if (item) {
        this.value = item.value;
        this.inputValue = '';
      } else {
        if (value) {
          this.inputValue = value;
          this.value = inputItem.value;
        } else {
          this.value = undefined;
          this.inputValue = '';
        }
      }
    } else {
      this.value = value == undefined ? undefined : value;
      this.inputValue = value == undefined ? '' : value;
    }
  }

  /**
   * 输入框的值
   */
  @observable public inputValue = '';

  @action public handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.inputValue = event.target.value;
    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback(this.inputValue);
    }
  };

  /**
   * 选择的值
   */
  @observable public value: undefined | string = undefined;

  @action public handleSelectValue = (value: undefined | string) => {
    this.value = this.value === value ? undefined : value;
    if (this.value != undefined) {
      if (this.value === this.data.find((item) => item.showInput)?.value) {
        this.inputRef.current?.focus();
      }
    }

    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback(this.value);
    }
  };

  /**
   * 输入框提示文字
   */
  @observable public placeholder = '请输入';

  @observable.ref public inputRef = React.createRef<InputRef>();

  /**
   * 是否禁止
   */
  @observable public disabled = false;

  /**
   * 值改变回掉
   */
  public handleChangeCallback: (value?: string | undefined) => void;

  @action public handleInputClick = () => {
    this.value = this.data.find((item) => item.showInput)?.value;
  };
}

