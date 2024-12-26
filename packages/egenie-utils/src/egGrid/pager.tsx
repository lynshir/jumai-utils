import { Pagination } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import type { EgGridModel } from './egGridModel';
import { ColumnSettingModal } from './columnSetting';
import styles from './egGridStyle.module.less';
import { Adaptation } from '../adaptation';
import { toJS } from 'mobx';

interface IProps<RowT> {
  store?: EgGridModel<RowT>;
  children?: React.ReactNode;
}

export const PagerContent = observer(<RowT,>({ store, children }: IProps<RowT>) => {
  const { selectedRowsLength, resetAllSelectedRows, showSelectedTotal, showReset, showPagination, showRefresh, onRefresh,
    setColumnsDisplay, sumColumns, onSelectSum, searchReduceConfig, rows, columns, selectRows, searchReduce,
    columnSettingModel, columnSettingModel: {
      openColumnSetting,
    }} = store;

  const [
    list,
    setList,
  ] = useState<any[]>();

  const extraRight = () => {
    return (
      <div>
        <div className={styles.paginationWrap}>
          {
            showPagination && <PaginationOfPager store={store}/>
          }
          {showRefresh && (
            <span
              className={styles.refreshWrap}
              onClick={onRefresh}
            >
              <i className={`${styles.edgBlue} icon-cxsc`}/>
              刷新
            </span>
          )}
          { setColumnsDisplay && (
            <span
              className={styles.refreshWrap}
              onClick={openColumnSetting}
            >
              <i className={`${styles.edgBlue} icon-setup`}/>
              设置
            </span>
          )}
        </div>
        <ColumnSettingModal store={columnSettingModel}/>
      </div>
    );
  };

  const extraLeft = () => {
    return (
      <div className={styles.edgPagerResetWrapper}>
        { showSelectedTotal ? (
          <div className={`${styles.edgPagerResetWrapper}`}>
            已勾选
            <span className={`${styles.edgBlue} ${styles.edgHasSelectedCount}`}>
              {selectedRowsLength}
            </span>
            条
            {showReset && (
              <span
                className={`${styles.edgBlue} ${styles.edgReset}`}
                onClick={resetAllSelectedRows}
              >
                重置
              </span>
            )}
          </div>
        ) : <div/>}
      </div>
    );
  };

  useEffect(() => {
    handleList();
  }, [
    sumColumns,
    selectRows,
    rows,
  ]);

  const handleList = () => {
    let _list = sumColumns && toJS([...sumColumns])?.reduce((res, columnKey) => {
      let item, field;

      // 判断汇总数据是否在column里 不在就不展示
      if (typeof columnKey === 'object') {
        const { name, key } = columnKey;
        item = columns.find((el) => el.key === key);
        field = name || '';
      } else {
        item = columns.find((el) => el.key === columnKey);
      }
      if (!item) {
        return res;
      }
      const labelName = field || (item?.name || '');

      let value;

      const reduceRows = onSelectSum ? selectRows : rows;
      if (typeof columnKey === 'object') {
        const { key, rule, tag, decimal } = columnKey;
        value = reduceRows.reduce((res, row) => {
          if (rule) {
            return res + (rule(row) as number || 0);
          }
          return res + Number(row[key] || 0);
        }, 0);
        value = tag === 'price' ? value.toFixed(decimal || 4) : decimal ? value.toFixed(decimal) : parseInt(value, 10);
      } else {
        value = reduceRows.reduce((res, row) => {
          return res + Number(row[columnKey] || 0);
        }, 0);
        value = Number(value) || 0;
      }

      return res.concat({
        key: item.key,
        name: labelName,
        value,
      });
    }, []);

    if (searchReduce && searchReduceConfig?.length) {
      _list.push({
        key: 'sumTitle',
        name: '查询汇总统计',
        value: '',
      });
    }
    const customList = searchReduceConfig?.reduce((pre, cur) => {
      const labelName = cur.name || '';
      const value = cur.value || 0;
      return pre.concat({
        key: labelName,
        name: labelName,
        value,
      });
    }, []);
    _list = _list.concat(customList);
    setList(_list);
  };
  return (
    <div className={styles.edgPagerWrapper}>
      <Adaptation
        extra={{
          right: extraRight(),
          left: extraLeft(),
        }}
        list={list || []}
      />
    </div>
  );
});

const PaginationOfPager = observer(<RowT,>({ store, children }: IProps<RowT>) => {
  const { current, onPageChange, onShowSizeChange, pageSize, pageSizeOptions, showQuickJumper, size, total } = store;
  return (
    <Pagination
      current={current}
      onChange={onPageChange}
      onShowSizeChange={onShowSizeChange}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      showQuickJumper={showQuickJumper}
      showSizeChanger
      showTotal={function(total) {
        return (
          <span className={`${styles.edgf12}`}>
            共
            {total}
            条记录
          </span>
        );
      }}
      size={size}
      total={total}
    />
  );
});
