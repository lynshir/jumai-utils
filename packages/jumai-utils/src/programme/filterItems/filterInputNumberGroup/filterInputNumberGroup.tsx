import { action, extendObservable, observable, toJS } from 'mobx';
import { formatNumber } from 'jumai-common';
import { FilterBase } from '../filterBase';
import { ENUM_FILTER_ITEM_TYPE } from '../types';

export function formatNumberString(value: [number, number]): string {
  if (value[0] == null && value[1] == null) {
    return '';
  }

  if (value[0] != null && value[1] != null) {
    return `${formatNumber(value[0])},${formatNumber(value[1])}`;
  } else if (value[0] == null) {
    return `,${formatNumber(value[1])}`;
  } else {
    return `${formatNumber(value[0])},`;
  }
}

export class FilterInputNumberGroup extends FilterBase {
  constructor(options: Partial<FilterInputNumberGroup>) {
    super(options);
    const {
      data,
      ...rest
    } = options;

    extendObservable(this, { ...rest });

    if (this.data.length > 1) {
      this.formatValue(`${this.selectValue},${formatNumberString(this.value)}`);
    } else {
      this.formatValue(formatNumberString(this.value));
    }

    this.snapshot.value = toJS(this.value);
    this.snapshot.selectedValue = this.selectValue;
  }

  /**
   * 类型标志
   */
  @observable public type: 'inputNumberGroup' = ENUM_FILTER_ITEM_TYPE.inputNumberGroup;

  /**
   * 最小值转化为参数的field
   */
  @observable public minParamsField = '';

  /**
   * 最大值转化为参数的field
   */
  @observable public maxParamsField = '';

  public toProgramme(): string | null {
    const numberString = formatNumberString(this.value);
    if (this.data.length > 1) {
      if (this.selectValue) {
        if (numberString) {
          return `${this.selectValue},${numberString}`;
        } else {
          return `${this.selectValue}`;
        }
      } else {
        return null;
      }
    } else {
      if (numberString) {
        return numberString;
      } else {
        return null;
      }
    }
  }

  public toParams(): {[key: string]: string; } {
    const numberString = formatNumberString(this.value);
    if (this.data.length > 1) {
      if (this.selectValue) {
        if (numberString) {
          return { [this.selectValue]: numberString };
        } else {
          return {};
        }
      } else {
        return {};
      }
    } else {
      if (numberString) {
        // 自定义参数处理
        if (this.maxParamsField && this.minParamsField) {
          const min = numberString.split(',')[0];
          const max = numberString.split(',')[1];
          return {
            [this.minParamsField]: min || null,
            [this.maxParamsField]: max || null,
          };
        } else {
          return { [this.field]: numberString };
        }
      } else {
        return {};
      }
    }
  }

  public translateParams(): string[] {
    const numberString = formatNumberString(this.value).replace(',', '至');
    if (this.data.length > 1) {
      if (this.selectValue) {
        if (numberString) {
          return [
            this.data.find((item) => item.value === this.selectValue)?.label || '',
            numberString,
          ];
        } else {
          return [];
        }
      } else {
        return [];
      }
    } else {
      if (numberString) {
        return [
          this.label,
          numberString,
        ];
      } else {
        return [];
      }
    }
  }

  public formatValue(value?: string | [number, number]): void {
    if (Array.isArray(value)) {
      this.value = value;
      this.selectValue = undefined;
    } else if (typeof value === 'string') {
      const array = String(value)
        .split(',');
      const result: [number, number] = [
        null,
        null,
      ];

      if (this.data.length > 1) {
        this.selectValue = array[0] || undefined;
        if (array[1]) {
          result[0] = formatNumber(array[1]);
        }

        if (array[2]) {
          result[1] = formatNumber(array[2]);
        }
      } else {
        this.selectValue = undefined;
        if (array[0]) {
          result[0] = formatNumber(array[0]);
        }

        if (array[1]) {
          result[1] = formatNumber(array[1]);
        }
      }

      this.value = result;
    } else {
      this.value = [
        null,
        null,
      ];
      this.selectValue = undefined;
    }
  }

  private snapshot: { value: [number, number]; selectedValue?: string; } = {
    value: [
      null,
      null,
    ],
    selectedValue: '',
  };

  @action public reset = (): void => {
    this.value = this.snapshot.value;
    this.selectValue = this.snapshot.selectedValue;

    if (typeof this.handleSelectChangeCallback === 'function') {
      this.handleSelectChangeCallback(this.selectValue);
    }

    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback([
        this.value[0],
        this.value[1],
      ]);
    }
  };

  /**
   * 下拉框的值。data的长度大于1才需要传。和inputAndSelect类似
   */
  @observable public selectValue = '';

  @action public handleSelectValue = (selectedValue: string) => {
    this.selectValue = selectedValue;
    if (typeof this.handleSelectChangeCallback === 'function') {
      this.handleSelectChangeCallback(this.selectValue);
    }
  };

  /**
   * 下拉框改变值回掉
   */
  public handleSelectChangeCallback: (value?: string | undefined) => void;

  /**
   * number输入框改变值回掉
   */
  public handleChangeCallback: (value?: [number, number]) => void;

  /**
   * 值[min, max]
   */
  @observable public value: [number, number] = [
    null,
    null,
  ];

  @action public onMinChange = (min: number | string | null) => {
    this.value[0] = typeof min === 'number' || typeof min === 'string' ? formatNumber(min) : null;
    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback([
        this.value[0],
        this.value[1],
      ]);
    }
  };

  @action public onMaxChange = (max: number | string | null) => {
    this.value[1] = typeof max === 'number' || typeof max === 'string' ? formatNumber(max) : null;
    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback([
        this.value[0],
        this.value[1],
      ]);
    }
  };

  /**
   * 输入框提示文字
   */
  @observable public placeholder: [string, string] = [
    '请输入',
    '请输入',
  ];

  /**
   * 是否禁止
   */
  @observable public disabled = false;

  /**
   * 每次改变步数，可以为小数
   */
  @observable public step = 1;
}

