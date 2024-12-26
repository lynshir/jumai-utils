import { action, extendObservable, observable } from 'mobx';
import { FilterBase } from '../filterBase';
import type { ENUM_SPLIT_SYMBOL } from '../types';
import { ENUM_FILTER_ITEM_TYPE } from '../types';
import { trimWhiteSpace } from '../utils';

export class FilterInput extends FilterBase {
  constructor(options: Partial<FilterInput>) {
    super(options);
    const {
      data,
      ...rest
    } = options;

    extendObservable(this, { ...rest });
    this.formatValue(this.value);
    this.snapshot = this.value;
  }

  /**
   * 类型标志
   */
  @observable public type: 'input' = ENUM_FILTER_ITEM_TYPE.input;

  public toProgramme(): string | null {
    if (trimWhiteSpace(this.value, this.isTrimWhiteSpace)) {
      return trimWhiteSpace(this.value, this.isTrimWhiteSpace);
    } else {
      return null;
    }
  }

  public toParams(): {[key: string]: string | string[]; } {
    const oldParams = this.toProgramme();
    if (oldParams) {
      const params = this.isMultipleSearch && this.isParamList ? oldParams.split(this.splitSymbol)
        .filter(Boolean) : oldParams;
      return { [this.field]: params };
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
  public formatValue(value?: string): void {
    this.value = trimWhiteSpace(value, this.isTrimWhiteSpace);
  }

  private snapshot = '';

  @action private handleCallback = () => {
    if (typeof this.onChangeCallback === 'function') {
      this.onChangeCallback(trimWhiteSpace(this.value, this.isTrimWhiteSpace));
    }
  };

  @action public reset = (): void => {
    this.value = this.snapshot;
    this.handleCallback();
  };

  /**
   * 输入的值
   */
  @observable public value = '';

  @action public onChange = (value: string): void => {
    this.value = value;
    this.handleCallback();
  };

  /**
   * 改变值回掉
   */
  public onChangeCallback: (value?: string) => void;

  /**
   * 是否去掉左右空格
   */
  @observable public isTrimWhiteSpace = true;

  /**
   * 输入框提示文字
   */
  @observable public placeholder = '请输入';

  /**
   * 是否可清除
   */
  @observable public allowClear = true;

  /**
   * 是否禁止
   */
  @observable public disabled = false;

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
   * 批量查询导出数组参数
   */
  @observable public isParamList = false;
}
