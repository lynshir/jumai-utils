import { message } from 'antd';
import type { BaseData, PaginationData } from 'jumai-common';
import type { Column, HeaderRendererProps, SortDirection, SortColumn, RowHeightArgs } from 'jumai-data-grid';
import { SelectColumn } from 'jumai-data-grid';
import _ from 'lodash';
import { set, observable, action, toJS, computed, reaction, intercept } from 'mobx';
import React from 'react';
import type { SubRowAction } from './cellFormatter/treeFormatter';
import { CellExpanderFormatter, ChildRowDeleteButton, subRowReducer } from './cellFormatter/treeFormatter';
import { ColumnSettingModel } from './columnSetting';
import styles from './egGridStyle.module.less';
import { DraggableHeaderRenderer } from './headerRenderers/draggableHeaderRenderer';
import { getUser, getColumnsConfig, saveColumnsConfig, cache } from './request';

declare global {
  interface Window {
    tenantUserName: string;
  }
}

export type StrOrNum = number | string;

export interface EnhanceColumn<TRow, TSummaryRow = unknown> extends Column<TRow> {
  sidx?: string;
  ejlHidden?: boolean;
  nameText?: string; // 如果表头是自定义了，要配置这个字段，这个字段用来做表格列拖拽设置的文字显示
  treeExpand?: boolean; // 如果列定义了这个字段，意味着这个单元格用来折叠和收起tree子表
}

export interface IObj {
  [key: string]: any;
}

export type ColumnType = Array<EnhanceColumn<IObj>>;
export interface ISubRow {
  parentId?: number | string;
  [key: string]: any;
}

export type QueryRespDataType<RowT> = PaginationData<RowT> | BaseData<RowT[]> | void;

export interface IEgGridApi<RowT> {
  onRowClick?: (rowId: StrOrNum, row?: RowT) => void;
  onRowSelectChange?: (ids: Set<React.Key>) => void;
  onRefresh?: (param?: IObj) => void;
  onSort?: (params: IObj) => void;
  onPageChange?: (page: StrOrNum, pageSize: StrOrNum) => void;
  onShowSizeChange?: (page: StrOrNum, pageSize: StrOrNum) => void;
  onQuery?: (params?) => Promise<QueryRespDataType<RowT>>;
  callbackAfterQuery?: (params?) => void;
  onToggleOrDeleteSubRow?: (rest?: SubRowAction) => Promise<RowDataList<RowT> | boolean>;
  onMouseInRow?: ((rowIdx: number, row: RowT, event?: React.UIEvent<HTMLDivElement>) => void) | null;
  onMouseOutRow?: ((rowIdx: number, row: RowT, event?: React.UIEvent<HTMLDivElement>) => void) | null;
}

export type TSummaryRows = string[] | IObj[] | ((rows?: IObj[]) => IObj[]);

export type TSumColumns = string[] | Array<{ key: string; name: string; rule?: (arg1?) => unknown; tag?: 'price' | 'number' ; decimal?: number ; }>;

export type TLabelName = Array<{ name: string;value: number | string ; }>;
export interface IEgGridModel<RowT = any> {
  columns: Array<EnhanceColumn<RowT>>;
  getColumns?: (topClass: IObj, selfClass: IObj) => Array<EnhanceColumn<RowT>>;
  rows?: RowT[];
  cursorRow?: RowT[];
  primaryKeyField: string;
  rowHeight?: number | ((args: RowHeightArgs<RowT>) => number) | null;
  headerRowHeight?: number;
  showCheckBox?: boolean;
  showBlankColumn?: boolean;
  selectedIds?: Set<React.Key>;
  clearToOriginal?: () => void;

  sortByLocal?: boolean;
  sortDirection?: SortDirection;

  showQuickJumper?: boolean;
  pageSizeOptions?: string[];
  pageSize?: number;
  current?: number;
  total?: number;

  showSelectedTotal?: boolean;
  showPagination?: boolean;
  showReset?: boolean;
  showPager?: boolean;
  showRefresh?: boolean;

  loading?: boolean;

  edgStyle?: React.CSSProperties;

  api?: IEgGridApi<RowT>;

  queryParam?: {
    pageSize?: StrOrNum;
    page?: StrOrNum;
    sord?: StrOrNum;
    sidx?: StrOrNum;
    filterParams?: IObj;
  };
  getFilterParams?: () => {[key: string]: string; };
  parent?: IObj;
  wrapClassName?: string;
  showEmpty?: boolean;
  forceRowClick?: boolean;
  showNoSearchEmpty?: boolean;
  showNormalEmpty?: boolean;
  setColumnsDisplay?: boolean;
  gridIdForColumnConfig?: string;
  summaryRows?: TSummaryRows ;
  sumColumns?: TSumColumns;
  onSelectSum?: boolean;
  searchReduce?: boolean;
  searchReduceConfig?: TLabelName;
  showGridOrderNo?: boolean;
  batchToogleSubRow?: boolean;
  emptyStatusView?: React.ReactNode;
  enableCellScroll?: boolean;
}

/**
 * 表格数据类型定义,RowT为推导的数据类型
 */
export type RowDataType<RowT> = {
  gridOrderNo?: string | number;
  isExpanded?: boolean;
  children?: Array<RowDataType<RowT>>;
  parentId?: StrOrNum;
} & RowT;

/**
 * 表格列数组类型
 */
export type RowDataList<RowT> = Array<RowDataType<RowT>>;
export class EgGridModel<RowT = any> {
  public onlyGridStructure?: true; // 纯主表结构

  @observable public parent: IObj;

  /**
   * 列配置
   * [{
   *   key: 'wmsReceiveOrderNo',
   *   name: '收货单编号',
   *   width: 200,
   *   sortable: true,
   *   resizable: true
   *  }]
   */
  @observable public columns = []; // 列配置

  /**
   * 行数据，接口请求回来或者自己mock
   */
  @observable public rows: RowDataList<RowT> = [];

  /**
   * 配置主键的字段， 必须配置
   */
  @observable public primaryKeyField = '';

  /**
   * 主键的值
   */
  @observable public primaryKeyFieldValue: number | string = '';

  /**
   * 是否可以勾选
   */
  @observable public showCheckBox = true;

  /**
   * 是否显示空白列
   */
  @observable public showBlankColumn = false;

  /**
   * 设置行高，默认38
   */
  @observable public rowHeight = 38;

  /**
   * 表头高度，默认42
   */
  @observable public headerRowHeight = 38;

  /**
   * 已选择的ids，使用时Array.from(selectedIds)
   */
  @observable public selectedIds = new Set<React.Key>([]);

  /**
   * rdg36排序列的字段
   */
  @observable public sortColumnKey = '';

  /**
   * rdg49排序列的字段，改为了数组
   */
  @observable public sortColumns: SortColumn[] = [];

  /**
   * 是否本地排序
   */
  @observable public sortByLocal = true;

  /**
   * 排序方向
   */
  @observable public sortDirection: SortDirection = 'ASC';

  /**
   * 分页器大小
   */
  @observable public size: 'default' | 'small' = 'small';

  /**
   * 是否显示快速跳转
   */
  @observable public showQuickJumper = true;

  /**
   * 指定每页可以显示多少条
   */
  @observable public pageSizeOptions = [
    '10',
    '20',
    '50',
    '100',
    '200',
    '500',
    '1000',
  ];

  /**
   * 指每页条数
   */
  @observable public pageSize = 50;

  /**
   * 当前页码
   */
  @observable public current = 1;

  /**
   * 横向滚动是否为0
   */
  @observable public scrollLeftIsZero = true;

  /**
   * 当前行
   */
  @observable public cursorRow: RowT = {} as RowT;

  /**
   * 外部回调api, 行点击，排序，分页器
   */
  @observable public api: IEgGridApi<RowT>;

  /**
   * 隐藏勾选总条数
   */
  @observable public showSelectedTotal = true;

  /**
   * 隐藏重置按钮
   */
  @observable public showReset = true;

  /**
   * 隐藏分页器
   */
  @observable public showPagination = true;

  /**
   * 隐藏刷新
   */
  @observable public showRefresh = true;

  /**
   * 隐藏分页器整行
   */
  @observable public showPager = true;

  /**
   * 表格包裹样式
   */
  @observable public edgStyle: React.CSSProperties;

  /**
   * 表格数据加载loading
   */
  @observable public loading = false;

  /**
   * 总条数
   */
  @observable public total = 0;

  /**
   * 最外层包裹样式
   */
  @observable public wrapClassName = '';

  /**
   * 显示空状态
   */
  @observable public showEmpty = false;

  @observable public showNoSearchEmpty = false;

  /**
   * 是否强制每次点击行内事件都触发rowClick事件
   */
  @observable public forceRowClick = false;

  @observable public columnSettingModel: ColumnSettingModel<RowT>;

  /**
   * 显示普通空态
   */
  @observable public showNormalEmpty = false;

  /**
   * 表格保存列必须要配置
   */
  @observable public gridIdForColumnConfig = '';

  /**
   * 是否允许设置列显隐
   */
  @observable public setColumnsDisplay = false;

  /**
   * 当前用户的username,保存列配置时使用
   */
  @observable public user = '';

  /**
   * 第一种行汇总方式，配置此字段将会在表格行的尾部增加一条row数据
   */
  @observable public summaryRows: TSummaryRows;

  /**
   * 第二种行汇总方式，配置此字段将会在表格的pager部分显示汇总信息
   */
  @observable public sumColumns: TSumColumns = [];

  /**
   * 第二种行汇总方式使用，是否勾选汇总，默认true, 设为false将会统计本页数据
   */
  @observable public onSelectSum = true;

  /**
   * 第二种行汇总方式使用，是否每次查询表格数据之后调用接口请求数据，默认false
   */
  @observable public searchReduce = false;

  /**
   * 第二种行汇总方式使用，是否每次查询表格数据之后调用接口请求数据，默认false
   */
  @observable public searchReduceConfig: TLabelName = [];

  /**
   * 是否展示序号列
   */
  @observable public showGridOrderNo = true;

  /**
   * 是否批量展开
   */
  @observable public batchToogleSubRow = false;

  /**
   * 空状态自定义传入
   */
  @observable public emptyStatusView?: React.ReactNode | null;

  /**
   * 是否启用单元格滚动
   */
  @observable public enableCellScroll?: boolean = true;

  @computed public get cacheKeyForColumnsConfig(): string {
    return `${this.user}_tsGrid_${ this.gridIdForColumnConfig}`;
  }

  /**
   * 获取选择的行数据
   */
  @computed public get selectRows() {
    const { selectedIds, rows, primaryKeyField } = this;
    return rows.filter((item) => selectedIds.has(item[primaryKeyField]));
  }

  /**
   * 组合序号列之后的行数据，渲染用，外部一般不用
   */
  @computed public get _rows() {
    const { rows } = this;
    if (!rows || !rows.length) {
      return [];
    }
    const { pageSize, current } = this;
    const currentPage = current || 1;
    const ret = rows.map((el, index) => {
      const row = { ...el };
      const orderNo = (currentPage - 1) * pageSize + index + 1;
      row.gridOrderNo = orderNo <= 9 ? `0${orderNo}` : orderNo;
      return row;
    });
    return ret;
  }

  /**
   * 组合序号列之后的列数据，渲染用，外部一般不用
   */
  @computed public get _columns() {
    const { columns = [], showCheckBox = true, toggleOrDeleteSubRow, primaryKeyField, showGridOrderNo } = this;
    if (!columns.length) {
      return columns;
    }

    const prevHandleColumns = columns.map((v, index) => {
      const { treeExpand, formatter, key } = v;
      const formatterCell = treeExpand ? {
        formatter({ row, isCellSelected }) {
          const hasChildren = row.children !== undefined;
          const hasParentId = row.parentId !== undefined;
          return (
            <div className={styles.rdgCellValue}>
              {formatter && formatter({
                row,
                isCellSelected,
              }) }
              {!formatter && row[key]}
              <span> </span>
              <div className={styles.rdgCellValue}>
                {hasChildren && (
                  <CellExpanderFormatter
                    expanded={row.isExpanded === true}
                    isCellSelected={isCellSelected}
                    onCellExpand={() => toggleOrDeleteSubRow({
                      id: row[primaryKeyField],
                      type: 'toggleSubRow',
                      primaryKeyField,
                    })}
                  />
                ) }
                {
                  (hasParentId) && (
                    <div className={styles.rdgCellValue}>
                      <ChildRowDeleteButton
                        isCellSelected={isCellSelected}
                        onDeleteSubRow={() => toggleOrDeleteSubRow({
                          id: row[primaryKeyField],
                          type: 'deleteSubRow',
                          primaryKeyField,
                        })}
                      />
                    </div>
                  )
                }
              </div>
            </div>
          );
        },
      } : {};
      return {
        minWidth: 80,
        width: columns.length - 1 === index ? undefined : 80,
        ...v,
        ...formatterCell,
      };
    });
    const ret = (showCheckBox ? [SelectColumn] : []).concat(showGridOrderNo ? [
      {
        key: 'gridOrderNo',
        width: 30,
        name: '序号',
        frozen: true,
        sortable: false,
        ejlHidden: false,
        resizable: true,
        formatter: ({ row }) => (
          <div style={{ textAlign: 'left' }}>
            {row.gridOrderNo}
          </div>
        ),
      },
    ] as ColumnType : []).concat([...prevHandleColumns])
      .filter((el: EnhanceColumn<IObj>) => !el.ejlHidden);

    return ret;
  }

  /**
   * 选择行的数量
   */
  @computed public get selectedRowsLength(): number {
    const { selectedIds } = this;
    return Array.from(selectedIds).length;
  }

  /**
   * 获取排序方式
   */
  @computed public get sortType() {
    const { sortColumns, sortColumnKey } = this;
    if (!sortColumns.length) {
      return {
        sord: '',
        sidx: '',
      };
    }
    const { columnKey, direction } = sortColumns[0];
    return {
      sord: direction,
      sidx: sortColumnKey || columnKey,
    };
  }

  /**
   * 查询表格数据参数
   */
  @computed public get queryParam(): IEgGridModel<RowT>['queryParam'] {
    const { pageSize, current } = this;
    const filterParams: IObj = typeof (this.getFilterParams) === 'function' ? { filterParams: this.getFilterParams() } : {};
    return Object.assign(filterParams, {
      pageSize,
      page: current,
    }, this.sortType);
  }

  public defaultRows: RowDataList<RowT>;

  @observable private beforeIdx: StrOrNum = '';

  @observable private cursorIdx: StrOrNum = '';

  constructor({ ...options }: IEgGridModel<RowT>) {
    // FIXME: 注意执行顺序，务必设置store在先，实例化滞后
    set(this, { ...(options || {}) });
    this.columnSettingModel = new ColumnSettingModel({ parent: this });
    reaction(() => this.batchToogleSubRow,
      (isExpanded, reaction) => {
        this.batchToggleOrDeleteSubRow(isExpanded);
      });
    this.getUser();
    intercept(this, 'rows', (change) => {
      change.newValue = change.newValue == null ? [] : change.newValue;
      return change;
    });
  }

  public getSummaryRows = () => {
    const { rows, summaryRows } = this;
    let summaryRowArray = [];
    if (typeof summaryRows === 'function') {
      summaryRowArray = summaryRows(rows);
    }
    if (Array.isArray(summaryRows)) {
      summaryRowArray = [
        (summaryRows as string[]).reduce((pre, cur: string) => {
          return {
            [cur]: rows.reduce((rPre, rCur) => {
              return rPre + (Number(rCur[cur]) || 0);
            }, 0),
            ...pre,
          };
        }, {}),
      ];
    }
    return summaryRowArray.length ? summaryRowArray : null;
  };

  public rowKeyGetter = (row: IObj) => {
    return row[this.primaryKeyField];
  };

  /**
   * 查询方案注入此方法，可通过gridModel.getFilterParams获取参数
   */
  public getFilterParams: () => {[key: string]: string; };

  public toggleOrDeleteSubRow = action(async({ id, type, primaryKeyField }: SubRowAction): Promise<void> => {
    const { rows, api: { onToggleOrDeleteSubRow }} = this;

    if (type === 'toggleSubRow' && onToggleOrDeleteSubRow) {
      const rowIndex = rows.findIndex((r) => r[primaryKeyField] === id);
      const row = rows[rowIndex];
      if (!(row && row.isExpanded)) {
        const reqRows = await onToggleOrDeleteSubRow({
          id,
          type,
          primaryKeyField,
        }) as RowDataList<RowT>;
        row.children = reqRows.map((v) => ({
          ...v,
          parentId: id,
        }));
      }
    }

    // 删除行且需要调用后端，且删除失败，那么什么都不做
    if (type === 'deleteSubRow' && onToggleOrDeleteSubRow) {
      const reqDeleteRow = await onToggleOrDeleteSubRow({
        id,
        type,
        primaryKeyField,
      });
      if (!reqDeleteRow) {
        return;
      }
    }
    const newRows = subRowReducer(rows, {
      id,
      type,
      primaryKeyField,
    });
    this.rows = newRows;
  });

  public batchToggleOrDeleteSubRow = action((isExpanded: boolean) => {
    const { rows, primaryKeyField } = this;
    const type = isExpanded ? 'toggleSubRow' : 'deleteSubRow';

    if (isExpanded) {
      let _rows = toJS(rows);
      for (let i = 0; i < _rows.length; i++) {
        const id = _rows[i][primaryKeyField];
        _rows = subRowReducer(_rows, {
          id,
          type,
          primaryKeyField,
          isBatch: true,
        });
      }
      this.rows = _rows;
    } else {
      let i = rows.length;
      let _rows = toJS(rows);
      while (i >= 0) {
        if (_rows[i]) {
          const id = _rows[i][primaryKeyField];
          _rows[i].isExpanded = false;
          _rows = subRowReducer(_rows, {
            id,
            type,
            primaryKeyField,
            isBatch: true,
          });
        }
        i--;
      }
      this.rows = _rows;
    }
  });

  /**
   * 行点击事件
   */
  public onRowClick = action((rowIdx, row) => {
    this.primaryKeyFieldValue = row[this.primaryKeyField];

    if (~rowIdx) {
      this.beforeIdx = this.cursorIdx;
      this.cursorIdx = rowIdx;
      this.cursorRow = row;
    }
    if (this.forceRowClick) {
      return this.triggerCursorRowClick();
    }
    row && this.beforeIdx !== this.cursorIdx && this.triggerCursorRowClick();
  });

  /**
   * 触发当前行点击事件
   */
  public triggerCursorRowClick = action(() => {
    this.api && this.api.onRowClick && this.api.onRowClick(this.cursorRow[this.primaryKeyField], this.cursorRow);
  });

  /**
   * 行悬浮进入事件
   */
  public onMouseInRow = action((rowIdx, row, event?: React.UIEvent<HTMLDivElement>) => {
    this.api?.onMouseInRow?.(rowIdx, row, event);
  });

  /**
   * 行悬浮离开事件
   */
  public onMouseOutRow = action((rowIdx, row, event?: React.UIEvent<HTMLDivElement>) => {
    this.api?.onMouseOutRow?.(rowIdx, row, event);
  });

  /**
   * 距离左侧滚动距离，目前用来渲染固定列的阴影
   * TODO: 待去抖
   */
  public onScroll = action((e) => {
    const { scrollLeft } = e.currentTarget;
    this.scrollLeftIsZero = scrollLeft === 0;
  });

  /**
   * 选择行切换时触发行选择改变事件
   */
  public onSelectedRowsChange = action((selectRows) => {
    this.selectedIds = selectRows;
    this.api?.onRowSelectChange && this.api.onRowSelectChange(selectRows);
  });

  public onResetSelected = action(() => {
    this.selectedIds = new Set([]);
  });

  /**
   * 重置行选择，触发外部行选择change事件
   */
  public resetAllSelectedRows = action(() => {
    this.onResetSelected();
    this.api?.onRowSelectChange && this.api.onRowSelectChange(this.selectedIds);
  });

  /**
   * 重置聚焦行
   */
  public resetCursorRow = action(() => {
    this.primaryKeyFieldValue = '';
    this.beforeIdx = this.cursorIdx;
    this.cursorIdx = '';
    this.cursorRow = {} as RowT;
    this.triggerCursorRowClick();
  });

  /**
   * 重置选择行和聚焦行
   */
  public resetAll = action(() => {
    this.resetAllSelectedRows();
    this.resetCursorRow();
  });

  /**
   * 重置所有
   */
  public clearToOriginal = action(() => {
    // 主表清空字表
    set(this, {
      rows: [],
      total: 0,
      current: 1,
      selectedIds: new Set([]),
      cursorIdx: '',
      cursorRow: {},
    });
    this.resetAll();
  });

  /**
   * 设置聚焦行为表格第一行
   */
  public setCursorRowToFirst = action(() => {
    if (!this.rows.length) {
      return this.resetCursorRow();
    }
    this.beforeIdx = this.cursorIdx;
    this.cursorIdx = 0;
    this.cursorRow = this.rows[0];
    this.triggerCursorRowClick();
  });

  /**
   * 组装拖拽列， TODO: 配置draggble参数
   */
  public draggableColumns = () => {
    const { _columns, handleColumnsReorder } = this;
    const HeaderRenderer = (props: HeaderRendererProps<IObj>) => {
      return (
        <DraggableHeaderRenderer
          {...props}
          onColumnsReorder={handleColumnsReorder}
        />
      );
    };

    return _columns.map((c) => {
      const key = c.key;
      if (key === 'select-row' || key === 'gridOrderNo' || key === this.primaryKeyField || c.frozen) {
        return c;
      }
      return {
        ...c,
        headerRenderer: HeaderRenderer,
      };
    }).concat(this.showBlankColumn ? [
      {
        key: 'finallyFixedColumn',
        name: ' ',
        width: 80,
        winWidth: 80,
        maxWidth: 80,
        draggable: false,
        resizable: false,
      },
    ] : []);
  };

  public twoLevelClone = (columnArr: any[]): any[] => {
    if (!Array.isArray(columnArr)) {
      return columnArr;
    }
    const tempArr = [];
    for (const el of columnArr) {
      tempArr.push({ ...el });
    }
    return tempArr;
  };

  /**
   * 交换顺序之后的回调
   */
  public handleColumnsReorder = action((sourceKey: string, targetKey: string) => {
    const { columns, columnSettingModel: { pannelItems }} = this;
    const sourceColumnIndex = columns.findIndex((c) => c.key === sourceKey);
    const targetColumnIndex = columns.findIndex((c) => c.key === targetKey);
    const pannelSourceIndex = pannelItems.findIndex((c) => c.key === sourceKey);
    const pannelTargetIndex = pannelItems.findIndex((c) => c.key === targetKey);
    const reorderedColumns = [...columns];

    pannelItems.splice(
      pannelTargetIndex,
      0,
      pannelItems.splice(pannelSourceIndex, 1)[0]
    );

    reorderedColumns.splice(
      targetColumnIndex,
      0,
      reorderedColumns.splice(sourceColumnIndex, 1)[0]
    );
    this.columns = reorderedColumns;
    const storage = this.getStorageParam(this.twoLevelClone(reorderedColumns));
    this.saveColumnsConfig(storage);
  });

  /**
   * 拖拽列大小之后的回调
   */
  public onColumnResize = action(_.debounce(((index, width) => {
    const _columns = this.twoLevelClone(this._columns);
    const columns = this.columns;
    const key = _columns[index].key;
    const item = columns.find((v) => v.key === key);
    if (!item) {
      return;
    }
    item.width = width;

    const storage = this.getStorageParam(this.twoLevelClone(columns));
    this.saveColumnsConfig(storage);
  }), 500));

  /**
   * 本地排序
   */
  public localSort = action((sortColumns: SortColumn[]) => {
    this.sortColumns = sortColumns;
    if (!sortColumns.length) {
      this.rows = toJS(this.defaultRows);
      this.sortColumnKey = '';
      return;
    }
    const { columnKey, direction } = sortColumns[0];
    this.sortColumnKey = columnKey;
    this.sortDirection = direction;
    if (direction === 'ASC') {
      this.defaultRows = toJS(this.rows).map(({ ...el }) => {
        return { ...el };
      });
    }

    const comparer = (a, b) => {
      const res = Number(a[columnKey]) - Number(b[columnKey]);
      if (Number.isNaN(res)) {
        a = a[columnKey] ? `${a[columnKey]}` : '';
        b = b[columnKey] ? `${b[columnKey]}` : '';
      }
      const ret = Number.isNaN(res) ? a.toLowerCase().localeCompare(b.toLowerCase()) : res;
      if (direction === 'ASC') {
        return ret;
      }
      if (direction === 'DESC') {
        return -ret;
      }
    };
    this.rows = this.rows.sort(comparer);
  });

  /**
   * 远端排序
   */
  public remoteSort = action((sortColumns: SortColumn[]) => {
    let param: { sidx?: string; sord?: string; } = {};
    this.sortColumns = sortColumns;
    if (sortColumns.length) {
      const { columnKey, direction } = sortColumns[0];
      this.sortDirection = direction;
      const col = this.columns.find((v) => v.key === columnKey);
      const realSortColumn = col && col.sidx ? col.sidx : columnKey;
      this.sortColumnKey = realSortColumn;
      param = {
        sidx: realSortColumn,
        sord: direction.toLowerCase(),
      };
    } else {
      this.sortColumnKey = '';
      param = {
        sidx: '',
        sord: '',
      };
    }
    this.api.onSort && this.api.onSort(param);
  });

  /**
   * 触发表格刷新，调用api.onRefresh方法
   */
  public onRefresh = action(() => {
    if (this.api.onRefresh) {
      this.loading = true;
      this.api.onRefresh();
    }
  });

  private isOnShowSizeChange = false;

  /**
   * 分页器change事件
   */
  public onPageChange = action((page: number, pageSize: number) => {
    if (this.isOnShowSizeChange) {
      this.isOnShowSizeChange = false;
      return;
    }

    this.isOnShowSizeChange = false;
    this.current = page;
    this.pageSize = pageSize;
    this.resetAll();
    if (this.api?.onPageChange) {
      this.api.onPageChange(page, pageSize);
    }
  });

  /**
   * 分页pageSizeChange
   */
  public onShowSizeChange = action((page: number, pageSize: number) => {
    this.isOnShowSizeChange = true;
    this.current = 1;
    this.pageSize = pageSize;
    this.resetAll();
    if (this.api?.onShowSizeChange) {
      this.api.onShowSizeChange(1, pageSize);
    }
  });

  /**
   * 表格查询事件，组合查询方案参数、重置所有
   */
  public onQuery = action((): Promise<QueryRespDataType<RowT>> => {
    const { pageSize, current, sortDirection, sortColumnKey } = this;
    const filterParams = typeof (this.getFilterParams) === 'function' ? this.getFilterParams() : {};
    if (!this.api.onQuery) {
      return Promise.reject();
    }
    this.resetAll();
    this.api.callbackAfterQuery?.(this);

    return this.api.onQuery({
      pageSize,
      page: current,
      sord: sortDirection,
      sidx: sortColumnKey,
      filterParams,
    });
  });

  // 获取当前租户登录账号
  public getUser = action(() => {
    if (this.setColumnsDisplay) {
      Promise.resolve(getUser()).then((v: { username?: string;[key: string]: any; }) => {
        const { username } = v;
        this.user = username;
      })
        .finally(this.getColumnsConfig);
    }
  });

  public getColumnsConfig = action(() => {
    getColumnsConfig(this.cacheKeyForColumnsConfig).then(
      action((v: { data?: string; }) => {
        const copyColumns = this.columns.slice();

        const res = v.data;
        cache.setStorage({
          cacheKey: this.cacheKeyForColumnsConfig,
          cacheValue: res || JSON.stringify({}),
        });
        if (!res) {
          return;
        }
        const _res = JSON.parse(res);
        if (!_res || (_res && !_res.length)) {
          return;
        }

        // 判断本地列是否有重复的key
        const keyArr = copyColumns.map((el) => el.key);
        const keySet = new Set(keyArr);
        if (Array.from(keySet).length !== copyColumns.length) {
          message.error('表格列key重复');
          return;
        }

        // 如果被删过某一列，或改过某一列的key, 或增加了一列
        // 修改列：key相同 name不同  ||  name相同  key不同
        // 新增  key/name都不同  新增列都放在最后

        // 找到新增列  以本地列为基准
        for (let i = 0; i < copyColumns.length; i++) {
          const el = copyColumns[i];
          const addItem = _res.find((v) => (v.key === el.key || v.name === el.name));
          if (!addItem) {
            _res.push(el);
          }
        }

        // 找出差异列 以线上的保存的列为基准
        for (let i = _res.length - 1; i >= 0; i--) {
          const el = _res[i];

          // 修改列
          const changeItem = copyColumns.find((v) => (v.key === el.key && v.name !== el.name) || (v.key !== el.key && v.name === el.name));
          if (changeItem) {
            changeItem.width = _res[i].width;// 修改列记录上次保存的宽度
            _res[i] = changeItem;
          }

          // 删除列
          const delItem = copyColumns.find((v) => v.key === el.key || v.name === el.name);
          if (!delItem) {
            _res.splice(i, 1);
          }
        }
        this.updateColumns(_res);
      })
    );
  });

  public getStorageParam = (columns: ColumnType) => {
    const storage = [];
    for (let k = 0, len = columns.length; k < len; k++) {
      const { width, ejlHidden, frozen, key, name } = columns[k];
      storage.push({
        key,
        name: name.toString(),
        frozen: frozen || false,
        ejlHidden: ejlHidden || false,
        ...(width ? { width: Math.floor(Number(width)) } : {}),
      });
    }
    return storage;
  };

  public saveColumnsConfig = action((config) => {
    if (this.setColumnsDisplay) {
      const data = {
        cacheKey: this.cacheKeyForColumnsConfig,
        cacheValue: JSON.stringify(config),
      };
      saveColumnsConfig(data).then((v: { status?: string ; }) => {
        if (v.status === 'Successful') {
          console.log('保存成功！');
        }
      });
    }
  });

  public updateColumns = action((columnsConfig) => {
    const { columns } = this;
    const tempColumns = [];
    const columnsMap = new Map();
    for (let i = 0; i < columns.length; i++) {
      const { key } = columns[i];
      columnsMap.set(key, columns[i]);
    }
    for (let i = 0; i < columnsConfig.length; i++) {
      const { key, ejlHidden, width } = columnsConfig[i];
      const item = columnsMap.get(key);
      if (item) {
        item.ejlHidden = ejlHidden;
        if (width) {
          item.width = width;
        }
        tempColumns.push(item);
      }
    }
    this.columns = tempColumns;
    this.columnSettingModel.pannelItems = this.twoLevelClone(tempColumns);
  });
}

