import type React from 'react';

export interface SortAndDisplaySettingItem {

  /**
   * 主键---唯一性自己保证,内部无法处理
   */
  primaryKey: string;

  /**
   * 某项显示的文字
   */
  label: string;

  /**
   * 是否显示某项
   */
  showItem: boolean;

  /**
   * 是否冻结(不可拖和排序)---自己需保证冻结列在开头(内部置顶是在最后一个冻结列后面)
   */
  frozen?: boolean;

  [key: string]: any;
}

export interface SortAndDisplaySettingViewProps {

  /**
   * 弹框标题
   */
  title: string;

  /**
   * 操作描述
   */
  description: string;

  /**
   * 是否显示恢复默认
   */
  showReset: boolean;

  /**
   * 取消回调函数
   */
  onCancel: (...arg: any[]) => any;

  /**
   * 初始化显示的数据
   */
  originData: SortAndDisplaySettingItem[];

  /**
   * 恢复默认的数据
   */
  initSettingData: SortAndDisplaySettingItem[];

  /**
   * 确定回调函数---业务逻辑自己实现
   */
  callback: (params: SortAndDisplaySettingItem[]) => Promise<any>;

  /**
   * 自定义渲染label
   */
  renderLabel?: (item?: SortAndDisplaySettingItem) => React.ReactNode;
}
