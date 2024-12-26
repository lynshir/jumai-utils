import { Spin, Button, Empty } from 'antd';
import DataGrid from 'egenie-data-grid';
import { observer } from 'mobx-react';
import React from 'react';
import { DragAndDropHOC } from '../dragAndDropHOC';
import type { EgGridModel } from './egGridModel';
import styles from './egGridStyle.module.less';
import { PagerContent } from './pager';
import { getStaticResourceUrl } from 'egenie-common';

interface IProps<RowT = any> {
  store?: EgGridModel<RowT>;
  children?: React.ReactNode;
}

export const EgGrid = observer(<RowT,>({ store, children }: IProps<RowT>) => {
  const {
    /* columns,
       rows, */
    _rows,
    rowKeyGetter,
    rowHeight,
    loading,
    scrollLeftIsZero,
    primaryKeyFieldValue,
    primaryKeyField,
    headerRowHeight,
    draggableColumns,
    selectedIds,
    onSelectedRowsChange,
    onQuery,
    sortColumns,
    sortByLocal,
    localSort,
    remoteSort,
    sortDirection,
    onRowClick,
    onScroll,
    showPager,
    edgStyle,
    wrapClassName,
    showEmpty,
    showNoSearchEmpty,
    showNormalEmpty,
    onColumnResize,
    getSummaryRows,
    onMouseInRow,
    onMouseOutRow,
    emptyStatusView,
    enableCellScroll,
  } = store;

  return (
    <Spin
      size="large"
      spinning={loading}
      style={{
        display: 'flex',
        height: '100%',
        flexFlow: 'column nowrap',
      }}
      wrapperClassName={styles.edgGridSpin}
    >
      <div className={`${styles.edgWrap} ${wrapClassName || ''}`}>
        <DragAndDropHOC>
          <DataGrid
            className={`${styles.edg} ${scrollLeftIsZero ? '' : `${styles.edgHasScroll}`}`}
            columns={draggableColumns()}
            emptyRowsRenderer={function EmptyRowsRenderer() {
              return (
                <div style={{ height: 'calc(100% - 38px)' }}>
                  {
                    emptyStatusView ||
                      (
                        <div className={styles.emptyRows}>
                          {showEmpty ? (
                            <>
                              <Empty
                                description="点击立即查询后，呈现数据！"
                                image={getStaticResourceUrl('pc/ts/egenie-common/images/noMsg.png')}
                              />
                              <Button
                                onClick={onQuery}
                                type="primary"
                              >
                                点击查询
                              </Button>

                            </>
                          ) : null}

                          {
                            showNoSearchEmpty && (
                              <Empty
                                description="查询后,呈现数据!"
                                image={getStaticResourceUrl('pc/ts/egenie-common/images/noMsg.png')}
                              />
                            )
                          }

                          {
                            showNormalEmpty && (
                              <Empty
                                description="暂无数据哦"
                                image={getStaticResourceUrl('pc/ts/egenie-common/images/empty.png')}
                              />
                            )
                          }
                        </div>
                      )
                  }
                </div>
              );
            }}
            enableCellScroll={enableCellScroll}
            headerRowHeight={headerRowHeight}
            onColumnResize={onColumnResize}
            onMouseInRow={onMouseInRow}
            onMouseOutRow={onMouseOutRow}
            onRowClick={onRowClick}
            onScroll={onScroll}
            onSelectedRowsChange={onSelectedRowsChange}
            onSortColumnsChange={sortByLocal ? localSort : remoteSort}
            rowClass={(row) => (row[primaryKeyField] === primaryKeyFieldValue ? `${styles.edgHightCursorRow}` : '')}
            rowHeight={rowHeight}
            rowKeyGetter={rowKeyGetter}
            rows={_rows}
            selectedRows={selectedIds}
            sortColumns={sortColumns}
            style={{ ...edgStyle }}
            summaryRows={getSummaryRows()}
          />
        </DragAndDropHOC>
        { showPager && <PagerContent store={store}/>}
      </div>
    </Spin>

  );
});
