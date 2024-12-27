import { set, observable, action, computed } from 'mobx';
import type { IObj } from '../egGridModel';
import type { MainSubStructureModel } from './mainSubStructureModel';
import type { IFilterItemsUpdateDict, ISubTableModel } from './subTableModel';
import { SubTableModel } from './subTableModel';

export interface ISubTableListModel<MainRowT, RowT> {
  top?: MainSubStructureModel<MainRowT, RowT>;
  activeTab?: string;
  tabsFlag?: {
    inited?: IObj;
    searched?: IObj;
  };
  list?: ISubTableModel<MainRowT, RowT>;
}

export class SubTableListModel<MainRowT, RowT> {
  /**
   * 子表激活tab
   */
  @observable public activeTab = '';

  @observable public tabsFlag = {
    inited: {},
    searched: {},
  };

  /**
  * 子表model与上层model链接参数
  */
  @observable public top: Partial<MainSubStructureModel<MainRowT, RowT>> = {};

  /**
   * 子表配置list，由上层传入
   */
  @observable public list = [];

  /**
   * 基于上层传入的子表gridModel组成的list,实例化子表,形成子表gridModel的list
   */
  @observable public listModel = [];

  /**
   * 获取聚焦子表
   */
  @computed public get cursorTabModel() {
    return this.listModel.find((el) => el.tab.value === this.activeTab);
  }

  constructor({ ...options }: ISubTableListModel<MainRowT, RowT>) {
    set(this, { ...(options || {}) });
    this.setListModel(this.list);
  }

  /**
   * 子表tab切换
   */
  public onClickTab = action((tabName: string) => {
    this.activeTab = tabName;
    const {
      tabsFlag: { inited, searched },
    } = this;
    this.tabsFlag.inited = {
      ...inited,
      [tabName]: true,
    }; // 初始化开关开，查询开关由内部的subTableModel设置，只要查了就设置
    if (!searched[tabName]) {
      // 如果该页签在最近一次行点击后还未获取过数据，那么search，在子表查询中会更改这里的searched状态，都点击一遍之后这里将都是true,之后不再执行
      if (this.cursorTabModel) {
        this.cursorTabModel.onQuery();
      }
    }
  });

  /**
   * 修改下拉查询选项
   *
   */
  public filterItemsUpdateDict = action((subTablesKey: string, dict: IFilterItemsUpdateDict) => {
    this.listModel.forEach((item) => {
      if (item.tab.value === subTablesKey) {
        item.filterItemsUpdateDict(dict);
      }
    });
  });

  /**
   * 设置子表listModel
   */
  public setListModel = action((list) => {
    this.listModel = list.map((el) => {
      return new SubTableModel({
        ...el,
        parent: this,
        top: this.top,
      });
    }, this);
  });
}
