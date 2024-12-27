const antdPatch = {
  // 颜色
  'blue-6': '@egenie-primary-color',
  'success-color': '@egenie-success-color',
  'warning-color': '@egenie-warning-color',
  'error-color': '@egenie-error-color',
  'badge-color': '@error-color',
  'label-required-color': '@error-color',
  'highlight-color': '@egenie-highlight-color',
  'heading-color': '@egenie-heading-color',
  'text-color': '@egenie-heading-color',
  'input-placeholder-color': '@egenie-input-placeholder-color',
  'text-color-secondary': '@egenie-text-color-secondary',
  'border-color-base': '@egenie-border-color-base',
  'border-color-split': '@egenie-border-color-split',
  'background-color-light': '@egenie-list-heading-bg',
  'table-row-hover-bg': '@egenie-table-row-hover-bg',
  'table-selected-row-bg': '@egenie-table-selected-row-bg',
  'disabled-bg': '@egenie-disabled-bg',
  'disabled-color': '@egenie-disabled-color',
  'primary-1': '#e5f0ff',
  'divider-color': '@egenie-text-color',
  'shadow-2': '@egenie-shadow',

  // 字体
  'font-size-base': '@egenie-font-size-sm',
  'font-size-sm': '@egenie-font-size-sm',
  'font-size-lg': '@egenie-font-size-sm + 2px',

  // 间距
  'height-lg': '@egenie-height-lg',
  'height-base': '@egenie-height-md',
  'height-sm': '@egenie-height-sm',
  'border-radius-base': '@egenie-border-radius-base',
  'padding-lg': '@egenie-spacing-lg',
  'padding-md': '@egenie-spacing-md',
  'padding-sm': '@egenie-spacing-sm',
  'padding-xs': '@egenie-spacing-xs',
  'padding-xss': '@egenie-spacing-xss',
  'margin-lg': '@egenie-spacing-lg',
  'margin-md': '@egenie-spacing-md',
  'margin-sm': '@egenie-spacing-sm',
  'margin-xs': '@egenie-spacing-xs',
  'margin-xss': '@egenie-spacing-xss',
  'control-padding-horizontal': '@padding-xs',
  'control-padding-horizontal-sm': '@padding-xs',

  // Modal-message
  'modal-header-padding-vertical': '13px',
  'modal-header-padding-horizontal': '@egenie-spacing-md',
  'modal-header-close-size': '48px',
  'modal-body-padding': '@egenie-spacing-md',
  'modal-footer-padding-vertical': '@egenie-spacing-xs',
  'modal-footer-padding-horizontal': '@egenie-spacing-md',
  'modal-confirm-body-padding': '@egenie-spacing-md @egenie-spacing-md @egenie-spacing-xs @egenie-spacing-md',
  'message-notice-content-padding': '@egenie-spacing-xs @egenie-spacing-md',
  'zindex-message': 9999,

  // drawer
  'drawer-header-padding': '@modal-header-padding-vertical @modal-header-padding-horizontal',
  'drawer-body-padding': '@modal-body-padding',
  'drawer-footer-padding-vertical': '@modal-footer-padding-vertical',
  'drawer-footer-padding-horizontal': '@modal-footer-padding-horizontal',
  'drawer-header-close-size': '@modal-header-close-size',

  // Radio-Checkbox
  'radio-size': '14px',
  'radio-dot-disabled-color': '@egenie-disabled-color',
  'checkbox-size': '14px',

  // Switch
  'switch-height': '22px',
  'switch-sm-height': '16px',
  'switch-disabled-opacity': 0.35,

  // input
  'input-padding-vertical-sm': '2px',
  'input-padding-vertical-base': '6px',
  'input-padding-vertical-lg': '8px',

  // form
  'form-item-margin-bottom': '@egenie-spacing-lg',
  'form-vertical-label-padding': '0 0 @egenie-spacing-xs',

  // tree
  'tree-title-height': '@egenie-spacing-lg',
  'tree-child-padding': '@egenie-spacing-md',
  'tree-node-selected-bg': '@primary-1',

  // card
  'card-head-padding': '@egenie-spacing-sm + 1px',
  'card-head-height': '48px',
  'card-head-height-sm': '36px',
  'card-padding-base': '(@egenie-spacing-md - 1)',
  'card-skeleton-bg': '#cfd8dc',
  'card-shadow': '@egenie-shadow',

  // collapse
  'collapse-header-padding': '(@padding-sm - 1)  @padding-md',
  'collapse-header-padding-extra': '@egenie-spacing-xxl',

  // tabs
  'tabs-horizontal-padding': '7px @egenie-spacing-md',
  'tabs-horizontal-padding-lg': '9px @egenie-spacing-md',
  'tabs-horizontal-padding-sm': '3px @egenie-spacing-md',
  'tabs-vertical-padding': '9px @egenie-spacing-md',
  'tabs-horizontal-gutter': 0,
  'tabs-horizontal-margin': 0,
  'tabs-vertical-gutter': 0,
  'tabs-vertical-margin': '(@egenie-spacing-sm / 2) 0',

  // tag
  'tag-line-height': '22px',

  // popover
  'popover-min-height': '32px',

  // Popover arrow width
  'popover-arrow-width': '6px',
  'popover-padding-horizontal': '@egenie-spacing-sm',

  // PageHeader
  'page-header-content-padding-vertical': '@padding-sm',
  'page-header-heading-title': '@egenie-font-size-md',
  'page-header-back-color': '@egenie-text-color-secondary',
  'page-header-padding-vertical': '@egenie-spacing-xs',
  'page-header-padding': '@egenie-spacing-md',
  'page-header-heading-sub-title': '@egenie-font-size-sm',
  'page-header-tabs-tab-font-size': '@egenie-font-size-md',

  // Pagination
  'pagination-item-size': '@egenie-height-sm',
  'pagination-item-size-sm': '@egenie-height-sm',

  // Menu
  'menu-inline-toplevel-item-height': '@egenie-height-lg',
  'menu-item-height': '@egenie-height-lg',
  'menu-item-active-border-width': '3px',
  'menu-item-vertical-margin': '@egenie-spacing-xs',
  'menu-item-boundary-margin': '@egenie-spacing-xs',
  'menu-item-padding-horizontal': '@egenie-spacing-md',
  'menu-item-padding': '0 @menu-item-padding-horizontal',
  'menu-horizontal-line-height': '46px',
  'menu-icon-margin-right': '@egenie-spacing-xs',

  // Typography
  'typography-title-font-weight': 500,
  'typography-title-margin-top': 0,
  'typography-title-margin-bottom': 0,

  // Statistic
  'statistic-title-font-size': '@egenie-font-size-md',
  'statistic-content-font-size': '@egenie-font-size-xxl',
  'statistic-unit-font-size': '@egenie-font-size-xxl',

  //  Result
  'result-title-font-size': '@egenie-font-size-xxl',
  'result-subtitle-font-size': '@egenie-font-size-sm',
  'result-icon-font-size': '72px',
  'result-extra-margin': '@egenie-spacing-xl 0 0 0',
};

const color = {
  // 主色调
  'egenie-primary-color': '#1978ff',

  // 白色
  'egenie-white': '#fff',

  // 标题色
  'egenie-heading-color': '#2b2e3e',

  // 一般文本色
  'egenie-text-color': '#6d6e78',

  // 辅助文本色
  'egenie-text-color-secondary': '#999ba4',

  // 输入框提示文字颜色
  'egenie-input-placeholder-color': '#c5c3cb',

  // 边框颜色
  'egenie-border-color-base': '#e2e2e5',

  // 列表分隔线颜色
  'egenie-border-color-split': '#f0f0f0',

  // 组合筛选框背景颜色
  'egenie-combine-filter-bg': '#f3f3f3',

  // 表头背景
  'egenie-list-heading-bg': '#f6f7f8',

  // 表格悬浮背景
  'egenie-table-row-hover-bg': '#ededed',

  // 表格选中背景
  'egenie-table-selected-row-bg': '#bfd9ff',

  // 表格点击背景
  'egenie-table-click-bg-color': '#bfd9ff',

  // 辅色调
  'egenie-secondary-color': '#4b6dff',

  // 成功颜色
  'egenie-success-color': '#02c190',

  // 警告颜色
  'egenie-warning-color': '#ff9948',

  // 错误颜色
  'egenie-error-color': '#f2270a',

  // 高亮颜色
  'egenie-highlight-color': '#f2270a',

  // 阴影
  'egenie-shadow': ' 0px 12px 48px 16px rgba(0, 0, 0, 0.03), 0px 9px 28px 0px rgba(0, 0, 0, 0.05), 0px 6px 16px -8px rgba(0, 0, 0, 0.08)',

  // 禁用背景
  'egenie-disabled-bg': '@egenie-combine-filter-bg',

  // 禁用颜色
  'egenie-disabled-color': '@egenie-input-placeholder-color',

  // 背景颜色
  'egenie-background-bg': '#f2f3f4',

  // 需要强调的卡片模块
  'egenie-highlight-card-bg': 'linear-gradient(331deg, #2d84ff 0%, #396fff 100%)',

  // 重要提示性内容背景底色
  'egenie-important-content-bg': 'rgba(red(@egenie-highlight-color), green(@egenie-highlight-color), blue(@egenie-highlight-color), 0.05)',

  // 标签、次重要按钮
  'egenie-secondary-content-bg': 'rgba(red(@egenie-primary-color), green(@egenie-primary-color), blue(@egenie-primary-color), 0.05)',
};

// 字体-行高
const font = {
  // 基本字体-行高
  'egenie-font-size-sm': '12px',
  'egenie-line-height-sm': '20px',

  // 中型字体-行高
  'egenie-font-size-md': '14px',
  'egenie-line-height-md': '22px',

  // 大字体-行高
  'egenie-font-size-lg': '16px',
  'egenie-line-height-lg': '24px',

  // 更大字体-行高
  'egenie-font-size-xl': '20px',
  'egenie-line-height-xl': '28px',

  // 超大字体-行高
  'egenie-font-size-xxl': '24px',
  'egenie-line-height-xxl': '32px',
};

const spacing = {
  // 菜单header高度
  'egenie-header-height': '40px',

  // 菜单内容padding
  'egenie-content-padding': '8px',

  // 菜单sider宽度
  'egenie-sider-width': '60px',

  // 超大间距
  'egenie-spacing-xxl': '40px',

  // 更大间距
  'egenie-spacing-xl': '32px',

  // 大间距
  'egenie-spacing-lg': '24px',

  // 中到大间距
  'egenie-spacing-mdl': '20px',

  // 中间距
  'egenie-spacing-md': '16px',

  // 小间距
  'egenie-spacing-sm': '12px',

  // 更小间距
  'egenie-spacing-xs': '8px',

  // 超小间距
  'egenie-spacing-xss': '4px',

  // 大高度
  'egenie-height-lg': '40px',

  // 中高度(默认)
  'egenie-height-md': '32px',

  // 小高度
  'egenie-height-sm': '24px',

  // 边框圆角
  'egenie-border-radius-base': '2px',
};

export const theme = {
  ...antdPatch,
  ...color,
  ...font,
  ...spacing,
};
