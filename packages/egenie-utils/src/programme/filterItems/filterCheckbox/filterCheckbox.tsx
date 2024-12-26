import { action, intercept, observable, extendObservable, toJS } from 'mobx';
import { FilterBase } from '../filterBase';
import { ENUM_FILTER_ITEM_TYPE } from '../types';

function formatValue(value?: string[] | string): string[] {
  if (Array.isArray(value)) {
    return value;
  } else if (typeof value === 'string') {
    return value.split(',')
      .filter(Boolean);
  } else {
    return [];
  }
}

export class FilterCheckbox extends FilterBase {
  constructor(options: Partial<FilterCheckbox>) {
    super(options);
    const {
      data,
      ...rest
    } = options;

    extendObservable(this, { ...rest });

    this.formatValue(this.value);
    this.snapshot = this.value;

    intercept(this, 'value', (change) => {
      change.newValue = Array.isArray(change.newValue) ? change.newValue : [];
      return change;
    });
  }

  /**
   * 类型标志
   */
  @observable public type: 'checkbox' = ENUM_FILTER_ITEM_TYPE.checkbox;

  public toProgramme(): string | null {
    if (Array.isArray(this.value) && this.value.length) {
      return this.value.join(',');
    } else {
      return null;
    }
  }

  public toParams(): {[key: string]: string | string[]; } {
    if (this.toProgramme() == null) {
      return {};
    }

    if (this.isParamList) {
      return { [this.field]: toJS(this.value) };
    } else {
      return { [this.field]: this.toProgramme() };
    }
  }

  /**
   * 是否将参数转化为Array,原来只支持转为string
   */
  @observable public isParamList = false;

  public translateParams(): string[] {
    if (Array.isArray(this.value) && this.value.length) {
      return [
        this.label,
        this.value.map((item) => this.data.find((val) => val.value === item)?.label || '')
          .join(','),
      ];
    } else {
      return [];
    }
  }

  @action
  public formatValue(value?: string | string[]): void {
    this.value = formatValue(value);
  }

  private snapshot: string[] = [];

  @action private handleCallback = () => {
    if (typeof this.onChangeCallback === 'function') {
      this.onChangeCallback(toJS(this.value));
    }
  };

  @action public reset = (): void => {
    this.value = this.snapshot;
    this.handleCallback();
  };

  /**
   * 选中值
   */
  @observable public value: string [] = [];

  @action public onChange = (value: string[]) => {
    this.value = value || [];
    this.handleCallback();
  };

  /**
   * 改变值回掉
   */
  public onChangeCallback: (value?: string[]) => void;

  /**
   * 是否禁止
   */
  @observable public disabled = false;
}

