import _ from 'lodash';
import { action, intercept, observable, extendObservable, toJS } from 'mobx';
import { FilterBase } from '../filterBase';
import { ENUM_FILTER_ITEM_TYPE } from '../types';

export class FilterCascader extends FilterBase {
  constructor(options: Partial<FilterCascader>) {
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
  @observable public type: 'cascader' = ENUM_FILTER_ITEM_TYPE.cascader;

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
      const translatePath: string[] = [];
      let currentData = this.data;
      for (let i = 0; i < this.value.length; i++) {
        const item = currentData.find((val) => val.value === this.value[i]);
        if (item) {
          currentData = item.children || [];
          translatePath.push(item.label);
        } else {
          currentData = [];
          translatePath.push('');
        }
      }

      return [
        this.label,
        translatePath.join(','),
      ];
    } else {
      return [];
    }
  }

  @action
  public formatValue(value?: string[] | string): void {
    if (Array.isArray(value)) {
      this.value = value;
    } else {
      this.value = _.toString(value)
        .split(',')
        .filter(Boolean);
    }
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
   * 选择的值
   */
  @observable public value: string[] = [];

  @action public onChange = (value: string[]) => {
    if (Array.isArray(value)) {
      this.value = value;
    } else {
      this.value = [];
    }

    this.handleCallback();
  };

  /**
   * 动态加载选项
   */
  public loadData: (selectedOptions: unknown) => void;

  /**
   * 值改回掉
   */
  public onChangeCallback: (value?: string[]) => void;

  /**
   * 输入框提示文字
   */
  @observable public placeholder = '请选择';

  /**
   * 是否可清除
   */
  @observable public allowClear = true;

  /**
   * 是否禁止
   */
  @observable public disabled = false;

  /**
   * 是否显示搜索框
   */
  @observable public showSearch = true;

  /**
   * 自定义 options 中 label name children 的字段
   */
  @observable public fieldNames: { value: string; label: string; children: string; } = {
    label: 'label',
    value: 'value',
    children: 'children',
  };

  /**
   * 当此项为 true 时，点选每级菜单选项值都会发生变化
   */
  @observable public changeOnSelect = false;
}
