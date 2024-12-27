import _ from 'lodash';
import { set, observable, action, computed, toJS } from 'mobx';
import type { ReactEventHandler, CSSProperties, ReactNode } from 'react';
import { getPerms } from '../../permission';
import { EgGridModel } from '../egGridModel';
import type { IObj, IEgGridApi, IEgGridModel } from '../egGridModel';
import { SubTableListModel } from './subTableListModel';
import type { ISubTableModel } from './subTableModel';

export interface IButton {
  text: string; // 必填
  permissionId?: string | string[]; // 必填
  handleClick?: (event: ReactEventHandler) => void; // 必填
  icon?: string;
  idx?: string | number;
  display?: (rows?) => boolean;
  group?: IButton[];
  style?: CSSProperties;
  type?: string;
  isHide?: boolean; // 按钮组是否隐藏（整组按钮都没有权限时使用,不需要外部传参）
  disabled?: boolean;
  isLabel?: boolean | string;
  isRight?: boolean; // 是否靠右展示
}

export interface IBtnExtraLeft {
  isWarnIcon: boolean; // 警告icon
  text: ReactNode; // 文字说明
  linkBtnText?: string; // 按钮
  handleLinkBtnClick?: (event: ReactEventHandler) => void; // 按钮点击事件
}

export interface ICollectData {
  name: string;
  value: string | number | ReactNode;
  color?: string;
}

export interface ICollectData {
  name: string;
  value: string | number | ReactNode;
  color?: string;
  style?: CSSProperties;
}

export type SubTableModelGenericList<RowT, SubRowT> = SubRowT extends any[] ? {[K in keyof SubRowT]: ISubTableModel<RowT, SubRowT[K]> } : Array<ISubTableModel<RowT, SubRowT>>;
export interface IMainSubStructureModel<RowT = any, SubRowT = any> {
  grid: IEgGridModel<RowT>;
  api: IEgGridApi<RowT>;
  subTables?: {
    activeTab: string;
    tabsFlag: {
      inited?: IObj;
      searched?: IObj;
    };
    list: SubTableModelGenericList<RowT, SubRowT>;
  };
  history?: IObj;
  hiddenSubTable?: boolean;
  buttons?: IButton[];
  btnExtraLeft?: IBtnExtraLeft;
  btnExtraRight?: ReactNode;
  pageId?: string;
  collectData?: ICollectData[];
}

export class MainSubStructureModel<RowT = any, SubRowT = any > {
  public mainSubStructure?: true; // 主子表结构

  /**
   * 表格配置，参考IEgGridModel
   */
  @observable public grid: IEgGridModel<RowT>;

  /**
   * 表格配置，参考IEgGridApi
   */
  @observable public api: IEgGridApi<RowT> = {};

  /**
   * 实例化时内部设置，外部使用方式同独立表格使用，此处为主表的gridModel
   */
  @observable public gridModel: EgGridModel<RowT>;

  /**
   * 存储上一次查询参数
   */
  @observable public history: IObj = {};

  /**
   * 子表model, 内部设置，无需外部调用
   */
  @observable public subTablesModel: IObj = {};

  /**
   * 子表model，外部配置
   */
  @observable public subTables: IMainSubStructureModel<RowT, SubRowT>['subTables'];

  /**
   * 主表button，外部配置
   */
  @observable public buttons: IMainSubStructureModel<RowT, SubRowT>['buttons'];

  /**
   * 主表button 左侧警告提示，跟在按钮后面，外部配置
   */
  @observable public btnExtraLeft: IMainSubStructureModel<RowT, SubRowT>['btnExtraLeft'];

  /**
   * 主表button 右侧信息展示，位置在按钮最后一行右侧，外部配置
   */
  @observable public btnExtraRight: IMainSubStructureModel<RowT, SubRowT>['btnExtraRight'];

  /**
   * 页面pageId,请求按钮权限使用，外部配置，
   */
  @observable public pageId: string;

  /**
   * 按钮权限，从后台获取
   */
  @observable public permissionOfButton: string[];

  /**
   * 按钮上方的数据汇总行
   */
  @observable public collectData?: ICollectData[] = [];

  @observable public getPermissionId = (permissionId: string): string => {
    return permissionId.indexOf('_') === -1 ? `${this.pageId}_${permissionId}` : permissionId;
  };

  @observable public hasPermission = (permissionId: string | string[]): boolean => {
    let permissionIdList: string[] = [];
    if (typeof (permissionId) === 'string') {
      permissionIdList.push(permissionId);
    } else {
      permissionIdList = permissionId;
    }
    const isPermission = permissionIdList.findIndex((el) => {
      return this.permissionOfButton.includes(this.getPermissionId(el));
    });
    return Boolean(isPermission !== -1);
  };

  @computed public get _buttons(): IMainSubStructureModel<RowT, SubRowT>['buttons'] {
    const { permissionOfButton, buttons } = this;
    if (!buttons.length) {
      return buttons;
    }

    // 没有权限控制，则全部显示
    if (!permissionOfButton) {
      return buttons;
    }
    const btns = buttons
      .filter((el) => {
        const { permissionId, group } = el;
        if (group) {
          return true;
        } // group留给下一步处理
        if (!permissionId) {
          return true;
        } // 没有permissionId字段说明不受权限影响
        return this.hasPermission(el.permissionId);
      })
      .map((button) => {
        const { group, type, ...firstButton } = button;
        if (!group) {
          return button;
        }
        const _group = toJS(group);

        // dropdown 类型 第一个按钮没有作用 也没有权限 如果其下的所有按钮都没有权限 那么整组按钮不显示
        if (type !== 'dropdown') {
          _group.unshift(firstButton);
        }
        const arr = _group.filter((el) => !el.permissionId || this.hasPermission(el.permissionId)); // 过滤掉没权限的
        if (!arr.length) {
          return {
            ...button,
            isHide: true,
          };
        } // 如果都没权限，返回isHide: true，留给下一步再过滤掉
        const ret = type !== 'dropdown' ? arr.shift() : {
          ...firstButton,
          type,
        }; // 提出第一项为主按钮
        if (!arr.length) {
          return ret;
        } // 如果剩余的是空数组，直接返回第一项作为按钮而不是按钮组
        ret.group = arr; // 否则把剩余arr的装配个ret
        return ret;
      })
      .filter((button) => !button.isHide); // 过滤掉false
    return btns;
  }

  // 获取按钮权限
  @observable public getPermission = async(): Promise<void> => {
    if (!window.top.EgeniePermission?.permissionList.length) {
      await getPerms();
    }
    this.permissionOfButton = window.top.EgeniePermission.permissionList;
  };

  @observable public foldModel = {
    tabPaneheight: 350,
    dragHeight: 0,
    startDragY: 0,
    fullScreen: false,
    onDragStart: action((e) => {
      // e.preventDefault();
      e.stopPropagation();
      this.foldModel.startDragY = e.clientY;
    }),
    onDragStop: action((e) => {
      e.preventDefault();
      e.stopPropagation();

      // this.foldModel.tabPaneheight = (350 - this.foldModel.dragHeight);
      this.foldModel.tabPaneheight += this.foldModel.startDragY - e.clientY;
    }),

    /* onDraging: action((e) => {
         e.stopPropagation();
         const { clientY } = e;
         if (this.foldModel.dragHeight === (clientY - this.foldModel.startDragY)) {
           return;
         }
         this.foldModel.dragHeight = clientY - this.foldModel.startDragY;
         this.foldModel.tabPaneheight -= (clientY - this.foldModel.startDragY);
         console.log(clientY - this.foldModel.startDragY, 'this.foldModel.startDragY');
       }), */
  };

  @observable public hiddenSubTable = false; // 是否只有主表,默认主子表

  /**
   * 查询方案注入此方法，可通过gridModel.getFilterParams获取参数
   */
  public getFilterParams: () => {[key: string]: string | string[]; };

  constructor({ ...options }: IMainSubStructureModel<RowT, SubRowT>) {
    set(this, { ...(options || {}) });
    this.setMainGridModel(options.grid, options.api);
    this.setSubTablesModel(options.subTables || {});
    set(this, {
      history: {
        pageSize: options.grid.pageSize || 50,
        sidx: '',
        sord: 'asc',
        page: 1,
      },
    });
  }

  /**
   * 设置主子表结构的主表gridModel，调用主表方式为：mainSubStructureModel.gridModel.xxxx
   */
  public setMainGridModel = action((grid, api) => {
    const { onSort, onRowClick, onRefresh, handlePageChange, onShowSizeChange, onQuery, onRowSelectChange } = this;
    const { onToggleOrDeleteSubRow, onMouseInRow, onMouseOutRow } = api;
    this.gridModel = new EgGridModel({
      ...grid,
      columns: grid.getColumns?.(this) ?? grid.columns,
      api: {
        onPageChange: handlePageChange,
        onShowSizeChange,
        onSort, // 排序
        onRowClick, // 行点击
        onRefresh,
        onQuery,
        onRowSelectChange,
        onToggleOrDeleteSubRow,
        onMouseInRow,
        onMouseOutRow,
      },
      parent: this,
    });
  });

  /**
   * 设置子表list
   */
  public setSubTablesModel = action((subTables) => {
    this.subTablesModel = new SubTableListModel({
      ...subTables,
      top: this,
    });
  });

  /**
   * 主表排序
   */
  public onSort = action(({ sidx, sord }) => {
    const data = {
      ...this.history,
      sidx,
      sord,
    };
    this.queryDataAndSetState(data);
  });

  /**
   * 主表行点击
   */
  public onRowClick = action((id, row) => {
    // TODO: 刷新子表
    const { activeTab, listModel, tabsFlag } = this.subTablesModel;
    tabsFlag.searched = {}; // 能进来说明点击的是不同行，所以清空searchFlag
    const table = listModel.find((el) => el.tab.value === activeTab);
    if (table) {
      const { gridModel } = table;
      if (gridModel) {
        gridModel.resetAll && gridModel.resetAll();
      }
      table.onQuery();
    }
    this.api.onRowClick?.(id, row);
  });

  /**
   * 主表刷新
   */
  public onRefresh = action(() => {
    const data = this.history;
    this.queryDataAndSetState(data);
    this.api.onRefresh?.(data);
  });

  /**
   * 主表pageChange
   */
  public handlePageChange = action((page, pageSize) => {
    const data = {
      ...this.history,
      page,
      pageSize,
    };
    this.queryDataAndSetState(data);
    this.api.onPageChange?.(page, pageSize);
  });

  /**
   * 主表pageSizeChange
   */
  public onShowSizeChange = action((page, pageSize) => {
    const data = {
      ...this.history,
      page,
      pageSize,
    };
    this.queryDataAndSetState(data);
    this.api.onShowSizeChange?.(page, pageSize);
  });

  /**
   * 主表onRowSelectChange
   */
  public onRowSelectChange = action((selectRows) => {
    this.api.onRowSelectChange?.(selectRows);
  });

  /**
   * 主表查询事件，组合查询方案参数、重置所有
   */
  public onQuery = action((): Promise<unknown> => {
    const filterParams = typeof this.getFilterParams === 'function' ? this.getFilterParams() : {};
    const params = Object.assign(this.gridModel.queryParam, { filterParams });

    // TODO: 重置表格参数
    this.gridModel.resetAll();
    params.page = 1;
    return this.queryDataAndSetState(params);
  });

  public queryDataAndSetState = action((data, flagOfRefresh = {}): Promise<unknown> => {
    this.gridModel.loading = true;
    this.history = _.cloneDeep(data);

    // 原来promise在catch时没有被reject
    if (this.api.onQuery) {
      return this.api.onQuery(data).then(
        action((v: IObj) => {
          this.gridModel.current = data.page >>> 0;
          this.gridModel.pageSize = data.pageSize >>> 0;
          this.gridModel.rows = v.data.list || [];
          this.gridModel.total = v.data.totalCount >>> 0;
          this.api.callbackAfterQuery?.(this);
          if (!this.gridModel.rows.length) {
            this.gridModel.showEmpty = false;
            this.gridModel.showNoSearchEmpty = false;
            this.gridModel.showNormalEmpty = true;
          }
          return data;
        })
      )
        .catch(() => {
          this.gridModel.rows = [];
          this.gridModel.total = 0;
        })
        .finally(() => {
          this.gridModel.loading = false;
        });
    } else {
      return Promise.reject();
    }
  });
}
