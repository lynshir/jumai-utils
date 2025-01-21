---
title: 适配
order: 7
toc: content
---

## 适配

```ts
interface ListProps {
  /** 展示列表 */
  list: ListItem[];
  extra?: ListExtraContent;
  placement?: TooltipPlacement; // top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom
  operationDirection?: 'vertical' | 'horizontal'; // 下拉项方向 纵向 | 横向
  type?: 'button' | 'custom'; // 默认表格形式 外传就是按钮类型 或者自定义
  moreIcon?: React.ReactNode;
  direction?: 'vertical' | 'horizontal'; // 方向 纵向 | 横向
  customNode?: React.ReactNode;
}

/**
 * 展示列表
 * 两种样式
 * 1）主表统计行
 * 2）按钮样式
 */
interface ListItem {
  key: string;
  name: string;
  value?: string; //主表统计行 统计列的值
  onClick?: () => Promise<void> | void; //按钮样式 按钮点击事件
}

type ListExtraPosition = 'left' | 'right';

type ListExtraMap = Partial<Record<ListExtraPosition, React.ReactNode>>;

type ListExtraContent = React.ReactNode | ListExtraMap;
```

## 代码示例

1、按钮样式

```js
<Adaptation
  direction="vertical"
  list={[
    {
      key: '1',
      name: '按钮1',
      onClick: () => {
        console.log('按钮1');
      },
    },
    {
      key: '2',
      name: '按钮2',
    },
    {
      key: '3',
      name: '按钮3',
    },
    {
      key: '4',
      name: '按钮4',
    },
  ]}
  operationDirection="vertical"
  placement="right"
  type="button"
/>
```

2、主表统计行

```js
<Adaptation
  extra={{
    right: extraRight(),
    left: extraLeft(),
  }}
  list={list || []}
/>
```
