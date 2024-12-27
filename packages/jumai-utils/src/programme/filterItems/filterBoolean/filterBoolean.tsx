import { action, extendObservable, observable } from 'mobx';
import { FilterBase } from '../filterBase';
import { ENUM_FILTER_ITEM_TYPE } from '../types';

export const ENUM_BOOLEAN_DATA = {
  yes: {
    value: '1',
    label: '是',
  },
  no: {
    value: '0',
    label: '否',
  },
};

export class FilterBoolean extends FilterBase {
  constructor(options: Partial<FilterBoolean>) {
    super(options);
    const {
      data,
      ...rest
    } = options;
    extendObservable(this, { ...rest });

    this.formatValue(this.value);
    this.snapshot = { value: this.value };
  }

  /**
   * 是否格式化成boolean参数
   */
  @observable public isFormatBoolean = true;

  /**
   * true时的文本
   */
  @observable public yesText = ENUM_BOOLEAN_DATA.yes.label;

  /**
   * false时的文本
   */
  @observable public noText = ENUM_BOOLEAN_DATA.no.label;

  /**
   * 类型标志
   */
  @observable public type: 'boolean' = ENUM_FILTER_ITEM_TYPE.boolean;

  public toProgramme(): string | null {
    if (this.value == undefined) {
      return null;
    } else {
      return this.value;
    }
  }

  public translateParams(): string[] {
    if (this.value == undefined) {
      return [];
    }

    return [
      this.label,
      this.value === ENUM_BOOLEAN_DATA.yes.value ? this.yesText : this.noText,
    ];
  }

  public toParams(): {[key: string]: boolean | number; } {
    if (this.value == undefined) {
      return {};
    }

    return { [this.field]: this.isFormatBoolean ? Boolean(Number(this.value)) : Number(this.value) };
  }

  private snapshot: { value: string | undefined; } = { value: undefined };

  @action public reset = (): void => {
    this.value = this.snapshot.value;
    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback(this.value);
    }
  };

  @action
  public formatValue(value?: string): void {
    this.value = value == undefined ? undefined : value;
  }

  /**
   * 选择的值
   */
  @observable public value: undefined | string = undefined;

  @action public handleValueChange = (value: undefined | string) => {
    this.value = this.value === value ? undefined : value;

    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback(this.value);
    }
  };

  /**
   * 值改变回调
   */
  public handleChangeCallback: (value?: string | undefined) => any;
}

