import { useMemo } from 'react';
import type { ListItem, ListizeMap, ListProps } from '../interface';

const DEFAULT_SIZE = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  right: 0,
};

export default function useVisibleRange(
  listSizes: ListizeMap,
  visibleListContentValue: number,
  listContentSizeValue: number,
  operationSizeValue: number,
  { list, direction = 'horizontal' }: { list: ListItem[]; } & ListProps
): [visibleStart: number, visibleEnd: number] {
  let charUnit: 'width' | 'height';
  let position: 'left' | 'top' | 'right';
  let transformSize: number;

  if (direction === 'horizontal') {
    charUnit = 'width';
    position = 'left';
    transformSize = Math.abs(0);
  } else {
    charUnit = 'height';
    position = 'top';
    transformSize = 0;
  }

  return useMemo(() => {
    if (!list?.length) {
      return [
        0,
        0,
      ];
    }

    const len = list.length;
    let endIndex = len;
    for (let i = 0; i < len; i += 1) {
      const offset = listSizes.get(list[i].key) || DEFAULT_SIZE;
      if (offset[position] + offset[charUnit] > transformSize + visibleListContentValue) {
        endIndex = i - 1;
        break;
      }
    }

    const startIndex = 0;
    return [
      startIndex,
      endIndex,
    ];
  }, [
    listSizes,
    visibleListContentValue,
    listContentSizeValue,
    operationSizeValue,
    transformSize,
    direction,
    list?.map((el) => el.key).join('_'),
  ]);
}
