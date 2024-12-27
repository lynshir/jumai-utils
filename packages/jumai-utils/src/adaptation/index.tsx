import ResizeObserver from 'rc-resize-observer';
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import styles from './index.module.less';
import useUpdate, { useUpdateState } from './hooks/useUpdate';
import type { ListProps, SizeInfo, ListizeMap } from './interface';
import useVisibleRange from './hooks/useVisibleRange';
import { SummaryContent } from './summaryContent';
import { OperationNode } from './operation';
import ExtraContent from './extraContent';
import { ButtonContent } from './buttonContent';

const getSize = (refObj: React.RefObject<HTMLElement>): SizeInfo => {
  const { offsetWidth = 0, offsetHeight = 0 } = refObj.current || {};
  return [
    offsetWidth,
    offsetHeight,
  ];
};

/**
 * Convert `SizeInfo` to unit value. Such as [123, 456] with `top` position get `123`
 * 横向取宽度  纵向取高度
 */
const getUnitValue = (size: SizeInfo, direction: string) => {
  return size[direction === 'horizontal' ? 0 : 1];
};

export const Adaptation = (props: ListProps) => {
  const { direction = 'horizontal', list, extra, placement, operationDirection, type, customNode, moreIcon } = props;
  const containerRef = useRef<HTMLDivElement>(); // 最外层 = extraLeft + listWrapper + extraright  +  收起按钮
  const extraLeftRef = useRef<HTMLDivElement>(); // 左侧额外元素
  const extraRightRef = useRef<HTMLDivElement>(); // 右侧额外元素
  const listWrapRef = useRef<HTMLDivElement>(); // list区域
  const operationsRef = useRef<HTMLDivElement>();// 收起按钮

  // list内容区域size 去掉额外添加的内容
  const [
    containerExcludeExtraSize,
    setContainerExcludeExtraSize,
  ] = useState<SizeInfo>([
    0,
    0,
  ]);

  // list的总长度
  const [
    listContentSize,
    setListContentSize,
  ] = useState<SizeInfo>([
    0,
    0,
  ]);

  // 收起按钮的size
  const [
    operationSize,
    setOperationSize,
  ] = useState<SizeInfo>([
    0,
    0,
  ]);

  // 元素区域宽高的集合
  const [
    listSizes,
    setListSizes,
  ] = useUpdateState<ListizeMap>(new Map());

  // ========================== Unit =========================
  const containerExcludeExtraSizeValue = getUnitValue(containerExcludeExtraSize, direction);
  const listContentSizeValue = getUnitValue(listContentSize, direction);
  const operationSizeValue = getUnitValue(operationSize, direction);
  const visibleListContentValue = containerExcludeExtraSizeValue < listContentSizeValue ? containerExcludeExtraSizeValue - operationSizeValue : listContentSizeValue; // list的可视区域宽度 | 高度

  const [
    visibleStart,
    visibleEnd,
  ] = useVisibleRange(
    listSizes,
    visibleListContentValue, // Container
    listContentSizeValue, // list
    operationSizeValue, // Operation
    { ...props }
  );

  // 更新list每一项的大小和位置
  const updateListSizes = () => setListSizes(() => {
    const newSizes: ListizeMap = new Map();
    list.forEach(({ key }) => {
      const btnNode = listWrapRef.current?.querySelector<HTMLElement>(`[data-node-key="${key}"]`);
      if (btnNode) {
        newSizes.set(key, {
          width: btnNode.offsetWidth,
          height: btnNode.offsetHeight,
          left: btnNode.offsetLeft,
          top: btnNode.offsetTop,
        });
      }
    });
    return newSizes;
  });

  useEffect(() => {
    updateListSizes();
  }, [list?.map((el) => el.key).join('_')]);

  // 监听屏幕containner size变化
  const onListHolderResize = useUpdate(() => {
    const containerSize = getSize(containerRef);
    const extraLeftSize = getSize(extraLeftRef);
    const extraRightSize = getSize(extraRightRef);
    setContainerExcludeExtraSize([
      containerSize[0] - extraLeftSize[0] - extraRightSize[0],
      containerSize[1] - extraLeftSize[1] - extraRightSize[1],
    ]);

    setListContentSize(getSize(listWrapRef));
    const newOperationSize = getSize(operationsRef);
    setOperationSize(newOperationSize);
    updateListSizes();
  });

  const startHiddenlist = list.slice(0, visibleStart);
  const endHiddenlist = list.slice(visibleEnd + 1);
  const hiddenList = [
    ...startHiddenlist,
    ...endHiddenlist,
  ];
  return (

    <ResizeObserver onResize={onListHolderResize}>
      <div className={`${styles.wrapper} ${styles.h100}`}>
        <div
          className={`${styles.content} ${styles.h100} ${styles.flexNone} ${direction === 'vertical' ? styles.fdColumn : null}`}
          ref={containerRef}
        >
          <ExtraContent
            extra={extra}
            position="left"
            ref={extraLeftRef}
          />
          <div
            className={styles.listContent}
            ref={listWrapRef}
          >

            <ResizeObserver onResize={onListHolderResize}>
              <div
                style={{ display: 'flex' }}
              >
                {type === 'button' && (
                  <ButtonContent
                    direction={direction}
                    list={list}
                  />
                )}
                {
                  !type && (
                    <SummaryContent
                      direction={direction}
                      list={list}
                    />
                  )
                }

              </div>
            </ResizeObserver>
          </div>
          <OperationNode
            list={hiddenList}
            moreIcon={moreIcon}
            operationDirection={operationDirection}
            placement={placement}
            ref={operationsRef}
            type={type}
          />
          <ResizeObserver onResize={onListHolderResize}>
            <ExtraContent
              extra={extra}
              position="right"
              ref={extraRightRef}
            />
          </ResizeObserver>
        </div>
      </div>

    </ResizeObserver>
  );
};

// export default React.forwardRef(Adaptation);
