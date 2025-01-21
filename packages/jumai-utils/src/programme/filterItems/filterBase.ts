import { action, intercept, observable } from 'mobx';
import type { FilterItemOptions, ValueAndLabelData } from './types';
import { formatValueAndLabelData } from './utils';

/**
 * 查询项基本类。抽取统一的字段和方法
 */
export abstract class FilterBase {
  constructor(options: FilterItemOptions = {}) {
    this.data = formatValueAndLabelData(options.data);
    intercept(this, 'data', (change) => {
      change.newValue = formatValueAndLabelData(change.newValue);
      return change;
    });
  }

  /**
   * 创建查询方案时对每个查询项值的处理
   * 外层一般不需要重写
   */
  public abstract toProgramme(): string | null;

  /**
   * 对外暴露的params的处理
   * 外层一般不需要重写
   */
  public abstract toParams(): {[key: string]: any; };

  /**
   * 格式化查询项值
   * 外层一般不需要重写
   */
  public abstract formatValue(value?: string): void;

  /**
   * 查询项重置
   * 外层一般不需要重写
   */
  public abstract reset(): void;

  /**
   * 查询项翻译的值
   * 外层一般不需要重写
   */
  public abstract translateParams(): string[];

  /**
   * 是否显示查询项
   */
  @observable public showItem = true;

  /**
   * label显示宽度
   */
  @observable public labelWidth = 92;

  /**
   * 查询项标识。必须且不能重复否则报错
   */
  @observable public field = '';

  /**
   * 查询项名称。必须且不能重复否则报错
   */
  @observable public label = '';

  /**
   * 按回车的回掉函数
   */
  @action public onPressEnter: (...arg: any[]) => any = () => {
    //
  };

  /**
   * 包裹div的样式
   */
  @observable.ref public style: React.CSSProperties = {};

  /**
   * 包裹div的className
   */
  @observable public className = '';

  /**
   * 查询项数据。为value、label形式。value必须为string，不然可能会出问题
   * 当type为radio时，item的showInput为true时，此项为可选可输入
   */
  @observable public data: ValueAndLabelData = [];

  /**
   * 设置查询项数据
   */
  @action public handleData = (data: ValueAndLabelData): void => {
    this.data = data;
  };

  /**
   * 是否是动态添加字段(方案保存、方案设置等需要过滤)
   */
  @observable public isDynamic = false;

  /**
   * 是否为必选字段
   */
  @observable public required = false;

  /**
   * 自定义校验
   */
  @action public validator = (): Promise<string> => {
    if (this.required === false) {
      return Promise.resolve('');
    }

    if (this.toProgramme() == null) {
      return Promise.reject(`请填写:${this.label}`);
    } else {
      return Promise.resolve('');
    }
  };

  /**
   * 是否在加载数据,内部按回车状态判断,防止多次回车,上层的filterItems请求多次
   */
  @observable public _isLoading = false;
}
