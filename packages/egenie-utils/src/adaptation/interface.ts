import type { TooltipPlacement } from 'antd/es/tooltip';

export type SizeInfo = [width: number, height: number];

export type ListizeMap = Map<
React.Key,
{ width: number; height: number; left: number; top: number; }
>;

export type ListExtraPosition = 'left' | 'right';

export type ListExtraMap = Partial<Record<ListExtraPosition, React.ReactNode>>;

export type ListExtraContent = React.ReactNode | ListExtraMap;

export interface ListProps{
  list: ListItem[];
  extra?: ListExtraContent;
  placement?: TooltipPlacement; // top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom
  operationDirection?: 'vertical' | 'horizontal'; // 下拉项方向 纵向 | 横向
  type?: 'button' | 'custom'; // 默认表格形式 外传就是按钮类型 或者自定义
  moreIcon?: React.ReactNode;
  direction?: 'vertical' | 'horizontal'; // 方向 纵向 | 横向
  customNode?: React.ReactNode;
}

export interface ListItem {
  key: string;
  name: string;
  value?: string;
  onClick?: () => Promise<void> | void;
}
