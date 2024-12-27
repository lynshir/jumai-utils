import _ from 'lodash';
import { action, observable, extendObservable, computed } from 'mobx';
import moment from 'moment';
import React from 'react';
import { FilterBase } from '../filterBase';
import { ENUM_FILTER_ITEM_TYPE } from '../types';

export enum FormatDateType {
  defaultFormat = 'YYYY-MM-DD HH:mm:ss',
  day = 'YYYY-MM-DD',
}

export type FilterDateValue = 'upToNow' | 'today' | 'yesterday' | 'recentThreeDays' | 'thisWeek' | 'recentSevenDays' | 'recentFifteenDays' | 'lastMonth' | 'thisMonth' | 'recentThirtyDays' | 'thisQuarter' | 'recentHalfYear' | 'thisYear' | 'recentYear';

export interface FilterDateDict {
  value: string;
  label: string;
  getTimes: () => [moment.Moment, moment.Moment];
}

export type FilterDateDateItem = FilterDateValue | FilterDateDict;

export const filterDateDict: {[key: string]: FilterDateDict; } = {
  upToNow: {
    value: 'upToNow',
    label: '截止当前',
    getTimes() {
      return [
        moment()
          .startOf('day'),
        moment(),
      ];
    },
  },
  today: {
    value: 'today',
    label: '今天',
    getTimes() {
      return [
        moment()
          .startOf('day'),
        moment()
          .endOf('day'),
      ];
    },
  },
  yesterday: {
    value: 'yesterday',
    label: '昨天',
    getTimes() {
      return [
        moment()
          .startOf('day')
          .subtract(1, 'days'),
        moment()
          .endOf('day')
          .subtract(1, 'days'),
      ];
    },
  },
  recentThreeDays: {
    value: 'recentThreeDays',
    label: '近3日',
    getTimes() {
      return [
        moment()
          .startOf('day')
          .subtract(2, 'days'),
        moment()
          .endOf('day'),
      ];
    },
  },
  thisWeek: {
    value: 'thisWeek',
    label: '本周',
    getTimes() {
      return [
        moment()
          .startOf('week'),
        moment()
          .endOf('day'),
      ];
    },
  },
  recentSevenDays: {
    value: 'recentSevenDays',
    label: '近7天',
    getTimes() {
      return [
        moment()
          .startOf('day')
          .subtract(6, 'days'),
        moment()
          .endOf('day'),
      ];
    },
  },
  recentFifteenDays: {
    value: 'recentFifteenDays',
    label: '近15天',
    getTimes() {
      return [
        moment()
          .startOf('day')
          .subtract(14, 'days'),
        moment()
          .endOf('day'),
      ];
    },
  },
  lastMonth: {
    value: 'lastMonth',
    label: '上月',
    getTimes() {
      return [
        moment()
          .subtract(1, 'months')
          .startOf('month'),
        moment()
          .subtract(1, 'months')
          .endOf('month'),
      ];
    },
  },
  thisMonth: {
    value: 'thisMonth',
    label: '本月',
    getTimes() {
      return [
        moment()
          .startOf('month'),
        moment()
          .endOf('day'),
      ];
    },
  },
  recentThirtyDays: {
    value: 'recentThirtyDays',
    label: '近30天',
    getTimes() {
      return [
        moment()
          .startOf('day')
          .subtract(29, 'days'),
        moment()
          .endOf('day'),
      ];
    },
  },
  thisQuarter: {
    value: 'thisQuarter',
    label: '本季度',
    getTimes() {
      return [
        moment()
          .startOf('quarter'),
        moment()
          .endOf('day'),
      ];
    },
  },
  recentHalfYear: {
    value: 'recentHalfYear',
    label: '近180天',
    getTimes() {
      return [
        moment()
          .startOf('day')
          .subtract(179, 'days'),
        moment()
          .endOf('day'),
      ];
    },
  },
  thisYear: {
    value: 'thisYear',
    label: '本年',
    getTimes() {
      return [
        moment()
          .startOf('year'),
        moment()
          .endOf('day'),
      ];
    },
  },
  recentYear: {
    value: 'recentYear',
    label: '近365天',
    getTimes() {
      return [
        moment()
          .startOf('day')
          .subtract(364, 'days'),
        moment()
          .endOf('day'),
      ];
    },
  },
};

function formatStartTime(startTime: moment.Moment | null, format: FilterDate['format'], formatParams: FilterDate['formatParams']): string {
  if (startTime && startTime.isValid()) {
    if (format === FormatDateType.defaultFormat) {
      return startTime.format(formatParams);
    } else {
      return startTime.startOf('day')
        .format(formatParams);
    }
  } else {
    return '';
  }
}

function formatEndTime(endTime: moment.Moment | null, format: FilterDate['format'], formatParams: FilterDate['formatParams']): string {
  if (endTime && endTime.isValid()) {
    if (format === FormatDateType.defaultFormat) {
      return endTime.format(formatParams);
    } else {
      return endTime.endOf('day')
        .format(formatParams);
    }
  } else {
    return '';
  }
}

export function formatTime(startTime: moment.Moment | null, endTime: moment.Moment | null, format: FilterDate['format'], formatParams: FilterDate['formatParams']): string {
  const startTimeStr = formatStartTime(startTime, format, formatParams);
  const endTimeStr = formatEndTime(endTime, format, formatParams);
  if (startTimeStr || endTimeStr) {
    return `${startTimeStr},${endTimeStr}`;
  } else {
    return '';
  }
}

/**
 * 时间范围
 */
export class FilterDate extends FilterBase {
  constructor(options: Partial<FilterDate>) {
    super(options);
    const {
      data,
      ...rest
    } = options;

    extendObservable(this, { ...rest });

    const dateDict = this.getActiveDateDict(this.dateDictValue);
    if (dateDict) {
      this.initValueByDateDict(dateDict);
    } else {
      this.dateDictValue = null;
    }

    this.snapshot = {
      selectValue: this.selectValue,
      startTime: this.startTime,
      endTime: this.endTime,
      dateDictValue: this.dateDictValue,
    };
  }

  /**
   * 类型标志。date为左右查询方案类型(带下拉选择,左右查询方案)。dateRange。DatePicker.Range
   */
  @observable public type: 'date' | 'dateRange' = ENUM_FILTER_ITEM_TYPE.date;

  /**
   * 日期类型转化为参数的field(默认dateType)
   */
  @observable public dateTypeParamsField = 'dateType';

  /**
   * 开始时间转化为参数的field
   */
  @observable public startParamsField = '';

  /**
   * 结束时间转化为参数的field
   */
  @observable public endParamsField = '';

  public toProgramme(): string | null {
    const timeString = formatTime(this.startTime, this.endTime, this.format, this.formatParams);
    if (this.type === ENUM_FILTER_ITEM_TYPE.date) {
      if (this.selectValue) {
        if (this.dateDictValue) {
          return `${this.selectValue},${this.dateDictValue}`;
        } else if (timeString) {
          return `${this.selectValue},${timeString}`;
        } else {
          return `${this.selectValue}`;
        }
      } else {
        return null;
      }
    } else {
      if (this.dateDictValue) {
        return this.dateDictValue;
      } else if (timeString) {
        return timeString;
      } else {
        return null;
      }
    }
  }

  public translateParams(): string[] {
    const timeString = formatTime(this.startTime, this.endTime, this.format, this.formatParams)
      .replace(',', '至');
    if (this.type === ENUM_FILTER_ITEM_TYPE.date) {
      if (this.selectValue) {
        if (timeString) {
          return [
            this.data.find((item) => item.value === this.selectValue)?.label || '',
            timeString,
          ];
        } else {
          return [];
        }
      } else {
        return [];
      }
    } else {
      if (timeString) {
        return [
          this.label,
          timeString,
        ];
      } else {
        return [];
      }
    }
  }

  public toParams(): {[key: string]: string; } {
    const timeString = formatTime(this.startTime, this.endTime, this.format, this.formatParams);
    if (this.type === ENUM_FILTER_ITEM_TYPE.date) {
      if (this.selectValue) {
        if (timeString) {
          if (this.dateTypeParamsField && this.startParamsField && this.endParamsField) {
            return {
              [this.dateTypeParamsField]: this.selectValue,
              [this.startParamsField]: timeString.split(',')[0] || null,
              [this.endParamsField]: timeString.split(',')[1] || null,
            };
          } else {
            return {
              dateType: this.selectValue,
              dateValue: timeString,
            };
          }
        } else {
          return {};
        }
      } else {
        return {};
      }
    } else {
      if (timeString) {
        if (this.startParamsField && this.endParamsField) {
          return {
            [this.startParamsField]: timeString.split(',')[0] || null,
            [this.endParamsField]: timeString.split(',')[1] || null,
          };
        } else {
          return { [this.field]: timeString };
        }
      } else {
        return {};
      }
    }
  }

  @action
  public formatValue(value?: string): void {
    const keyAndValues = _.toString(value)
      .split(',');
    if (this.type === ENUM_FILTER_ITEM_TYPE.date) {
      this.selectValue = keyAndValues[0] ? keyAndValues[0] : undefined;
      const dateDict = this.getActiveDateDict(keyAndValues[1]);
      if (dateDict) {
        this.initValueByDateDict(dateDict);
      } else {
        this.dateDictValue = null;
        this.startTime = keyAndValues[1] ? moment(keyAndValues[1]) : null;
        this.endTime = keyAndValues[2] ? moment(keyAndValues[2]) : null;
      }
    } else {
      this.selectValue = undefined;
      const dateDict = this.getActiveDateDict(keyAndValues[0]);
      if (dateDict) {
        this.initValueByDateDict(dateDict);
      } else {
        this.dateDictValue = null;
        this.startTime = keyAndValues[0] ? moment(keyAndValues[0]) : null;
        this.endTime = keyAndValues[1] ? moment(keyAndValues[1]) : null;
      }
    }
  }

  @action public validator = (): Promise<string> => {
    if (this.required === false) {
      return Promise.resolve('');
    }

    if (this.type === ENUM_FILTER_ITEM_TYPE.date) {
      if (this.selectValue) {
        if (this.startTime || this.endTime) {
          return Promise.resolve('');
        } else {
          return Promise.reject('请选择时间范围');
        }
      } else {
        return Promise.reject('请选择时间类型');
      }
    } else {
      if (this.startTime || this.endTime) {
        return Promise.resolve('');
      } else {
        return Promise.reject(`请填写:${this.label}`);
      }
    }
  };

  private snapshot: { startTime: moment.Moment | null; endTime: moment.Moment | null; selectValue: string; dateDictValue: string; } = {
    startTime: null,
    endTime: null,
    selectValue: '',
    dateDictValue: null,
  };

  @action private handleCallback = () => {
    if (typeof this.handleChangeCallback === 'function') {
      this.handleChangeCallback([
        this.startTime,
        this.endTime,
      ]);
    }
  };

  @action public reset = (): void => {
    this.dateDictValue = this.snapshot.dateDictValue;
    this.startTime = this.snapshot.startTime;
    this.endTime = this.snapshot.endTime;
    this.selectValue = this.snapshot.selectValue;
    this.open = [
      false,
      false,
    ];
    this.handleCallback();
  };

  /**
   * 是否允许清除
   */
  @observable public allowClear = true;

  /**
   * 允许起始项部分为空。type为dateRange生效
   */
  @observable public allowEmpty: [boolean, boolean] = [
    true,
    true,
  ];

  /**
   * 日期类型选中值
   */
  @observable public selectValue: string | undefined = undefined;

  /**
   * 日期改变回掉
   */
  public handleChangeCallback: (date?: [moment.Moment, moment.Moment]) => void;

  @action public handleSelectChange = (selectValue: string | undefined) => {
    this.selectValue = selectValue;
  };

  /**
   * 日期展示格式
   */
  @observable public format: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD' = FormatDateType.defaultFormat;

  /**
   * 日期转化成参数格式
   */
  @observable public formatParams: 'YYYY-MM-DD HH:mm:ss' | 'YYYY-MM-DD' = FormatDateType.defaultFormat;

  /**
   * 开始时间
   */
  @observable.ref public startTime: moment.Moment | null = null;

  /**
   * 结束时间
   */
  @observable.ref public endTime: moment.Moment | null = null;

  /**
   * 禁止状态
   */
  @observable public disabled: [boolean, boolean] = [
    false,
    false,
  ];

  @action public handleStartChange = (startTime: moment.Moment | null) => {
    this.startTime = startTime;
    this.dateDictValue = null;
    this.handleCallback();
  };

  @action public handleEndChange = (endTime: moment.Moment | null) => {
    this.endTime = endTime;
    this.dateDictValue = null;
    this.handleCallback();
  };

  @action public handleRangeChange = (dates: [moment.Moment, moment.Moment]) => {
    this.startTime = dates?.[0];
    this.endTime = dates?.[1];
    this.dateDictValue = null;
    this.handleCallback();
  };

  /**
   * 输入框提示文字
   */
  @observable public placeholder: [string, string] = [
    '开始时间',
    '结束时间',
  ];

  /**
   * 预设时间字典。可以根据实际选取，或者新增
   */
  @observable.ref public dateDict: FilterDateDateItem[] = Object.values(filterDateDict);

  @computed
  public get realDateDict(): FilterDateDict[] {
    const result: FilterDateDict[] = [];
    this.dateDict.forEach((item) => {
      if (typeof item === 'string') {
        result.push({
          value: item,
          label: filterDateDict[item].label,
          getTimes: filterDateDict[item].getTimes,
        });
      } else {
        result.push(item);
      }
    });

    return result;
  }

  /**
   * 默认的字典值,会根据字典设置对应开始时间和结束时间
   */
  @observable public dateDictValue: FilterDateValue | string = null;

  private getActiveDateDict = (dateDictValue: string): FilterDateDict => {
    return this.realDateDict.find((item) => item.value === dateDictValue);
  };

  private initValueByDateDict = (dateDict: FilterDateDict): void => {
    const [
      startTime,
      endTime,
    ] = dateDict.getTimes();

    this.dateDictValue = dateDict.value;
    this.startTime = startTime;
    this.endTime = endTime;
  };

  @action public handleDateDictChange = (dateDictValue: string) => {
    const item = this.getActiveDateDict(dateDictValue);
    if (item) {
      this.initValueByDateDict(item);
    }
    this.open = [
      false,
      false,
    ];
    this.handleCallback();
  };

  @observable public open: [boolean, boolean] = [
    false,
    false,
  ];

  @observable public containerRef = React.createRef<HTMLDivElement>();

  @action public fixPanelHideNotSetTime = (isOpen: boolean): void => {
    const containerRef = this.containerRef;
    const startPlaceHolder = this.placeholder[0];
    const endPlaceHolder = this.placeholder[1];

    if (this.format === FormatDateType.defaultFormat && !isOpen && containerRef.current) {
      // 应该和antd内部设置时间有冲突,不这样写无法设置
      setTimeout(() => {
        const startElement: HTMLInputElement = containerRef.current.querySelector(`.ant-picker input[placeholder=${startPlaceHolder}]`);
        const endElement: HTMLInputElement = containerRef.current.querySelector(`.ant-picker input[placeholder=${endPlaceHolder}]`);
        const startValue = startElement?.value;
        const endValue = endElement?.value;

        if (startValue) {
          this.startTime = moment(startValue);
        }

        if (endValue) {
          this.endTime = moment(endValue);
        }
      });
    }
  };
}

