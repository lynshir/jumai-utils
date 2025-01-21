import { css } from '@linaria/core';
import type { HeaderRendererProps } from '../types';
const headerSortCell = css`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const headerSortCellClassname = `rdg-header-sort-cell ${headerSortCell}`;

const headerSortName = css`
  flex-grow: 1;
  overflow: hidden;
  overflow: clip;
  text-overflow: ellipsis;
`;

const headerSortNameClassname = `rdg-header-sort-name ${headerSortName}`;

type SharedHeaderCellProps<R, SR> = Pick<
  HeaderRendererProps<R, SR>,
  'sortDirection' | 'onSort' | 'priority'
>;
interface Props<R, SR> extends SharedHeaderCellProps<R, SR> {
  children: React.ReactNode;
}

export default function SortableHeaderCell<R, SR>({
  onSort,
  sortDirection,
  priority,
  children
}: Props<R, SR>) {
  let sortText = '';
  if (sortDirection === 'ASC') {
    sortText = '\u25B2';
  } else if (sortDirection === 'DESC') {
    sortText = '\u25BC';
  } else {
    sortText = '\u2b0d';
  }
  return (
    <span className={headerSortCellClassname} onClick={(e) => {
      console.log('react-data-grid组件，点击了表头排序')
      onSort(e.ctrlKey)
    }}>
      <span className={headerSortNameClassname}>{children}</span>
      <span>
        <span className='rdg-header-sort-icon' style={{fontSize: sortDirection ? '12px' : '16px', marginLeft: '3px'}}>{sortText}</span>
        {priority}
      </span>
    </span>
  );
}
