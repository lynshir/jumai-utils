import { UpOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';
import React from 'react';
import type { RowDataList } from '../egGridModel';
import styles from '../egGridStyle.module.less';
import { useFocusRef } from './useFocusRef';

type StrOrNum = string | number;
export interface SubRowAction {
  type: 'toggleSubRow' | 'deleteSubRow';
  id: StrOrNum;
  primaryKeyField: StrOrNum;
  isBatch?: boolean;
}

interface CellExpanderFormatterProps {
  isCellSelected: boolean;
  expanded: boolean;
  onCellExpand: () => void;
}

interface ChildRowDeleteButtonProps {
  isCellSelected: boolean;
  isDeleteSubRowEnabled?: boolean;
  onDeleteSubRow: () => void;
}

export function toggleSubRow<RowT>(rows: RowDataList<RowT>, id: StrOrNum, primaryKeyField: StrOrNum, isBatch: boolean): RowDataList<RowT> {
  try {
    const rowIndex = rows.findIndex((r) => r[primaryKeyField] === id);
    const row = rows[rowIndex];
    const { children } = row;
    if (!children || (isBatch && row.isExpanded)) {
      return rows;
    }

    const newRows = [...rows];
    newRows[rowIndex] = {
      ...row,
      isExpanded: !row.isExpanded,
    };
    if (!row.isExpanded) {
      newRows.splice(rowIndex + 1, 0, ...children);
    } else {
      newRows.splice(rowIndex + 1, children.length);
    }
    return newRows;
  } catch (error) {
    console.log(error);
    return rows;
  }
}

// FIXME: 限制了主子表的行唯一id的字段相同，即配置的primaryKeyField，且子表里的每一行都需要有parentId
// FIXME: 若children表的主key不是主表的primaryKeyField， 可以手动给子表添加一个key,由主表的primaryKeyField-子表的key组成
// FIXME: 若children表的parentId没有，可以前端自己给每一行加上，值就是主表row的primaryKeyField对应的值
export function deleteSubRow<T>(rows: RowDataList<T>, id: StrOrNum, primaryKeyField: StrOrNum, isBatch: boolean): RowDataList<T> {
  const row = rows.find((r) => r[primaryKeyField] === id);
  if (!row || !row.parentId) {
    return rows;
  }

  // 在已展开的行中删除
  const newRows = rows.filter((r) => r[primaryKeyField] !== id);
  if (isBatch) {
    return newRows;
  }

  // 从主表中删除子表
  const parentRowIndex = newRows.findIndex((r) => r[primaryKeyField] === row.parentId);
  const { children } = newRows[parentRowIndex];
  if (children) {
    const newChildren = children.filter((sr) => sr[primaryKeyField] !== id);
    newRows[parentRowIndex] = {
      ...newRows[parentRowIndex],
      children: newChildren,
    };
  }

  return newRows;
}

export function subRowReducer<T>(rows: RowDataList<T>, { type, id, primaryKeyField, isBatch }: SubRowAction): RowDataList<T> {
  switch (type) {
    case 'toggleSubRow':
      return toggleSubRow<T>(rows, id, primaryKeyField, isBatch);
    case 'deleteSubRow':
      return deleteSubRow<T>(rows, id, primaryKeyField, isBatch);
    default:
      return rows;
  }
}

export function CellExpanderFormatter({
  isCellSelected,
  expanded,
  onCellExpand,
}: CellExpanderFormatterProps): JSX.Element {
  const iconRef = useFocusRef<HTMLSpanElement>(isCellSelected);

  function handleClick(e: React.MouseEvent<HTMLSpanElement>) {
    e.stopPropagation();
    onCellExpand();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onCellExpand();
    }
  }

  return (
    <span
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={iconRef}
      tabIndex={-1}
    >
      {expanded ? (
        <UpOutlined
          className={styles.squareOutlined}
        />
      ) : (
        <DownOutlined
          className={styles.squareOutlined}
        />
      )}
    </span>
  );
}

export function ChildRowDeleteButton({
  isCellSelected,
  onDeleteSubRow,
}: ChildRowDeleteButtonProps): JSX.Element {
  const iconRef = useFocusRef<HTMLSpanElement>(isCellSelected);

  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onDeleteSubRow();
    }
  }

  return (
    <span
      onClick={onDeleteSubRow}
      onKeyDown={handleKeyDown}
      ref={iconRef}
      tabIndex={-1}
    >
      <DeleteOutlined className={styles.squareOutlined}/>
    </span>
  );
}
