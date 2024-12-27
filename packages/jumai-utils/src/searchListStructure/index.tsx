import { observable } from 'mobx';
import { observer } from 'mobx-react';
import type { CSSProperties, ReactNode } from 'react';
import React, { Component } from 'react';
import type { IMainSubStructureModel } from '../egGrid';
import { MainSubStructure, MainSubStructureModel } from '../egGrid';
import { NormalProgramme, NormalProgrammeComponent } from '../programme';
import type { NormalProgrammeParams, ValueAndLabelData } from '../programme';
import styles from './index.module.less';

interface IStore<RowT = any, SubRowT = any> {
  grid: IMainSubStructureModel<RowT, SubRowT>;
  programme: Partial<NormalProgrammeParams>;
  dict?: {[key: string]: ValueAndLabelData; };
  className?: string;
  style?: CSSProperties;
}

export class SearchListModal<RowT = any, SubRowT = any> {
  constructor(props: IStore<RowT, SubRowT>) {
    const init = () => {
      this.grid = new MainSubStructureModel({
        ...props.grid,
        hiddenSubTable: true,
      });

      this.programme = new NormalProgramme({
        ...props.programme,
        dict: props.dict,
        handleSearch: this.grid.onQuery,
      });
    };

    init();
    this.grid.getFilterParams = () => this.programme.filterItems.params;
  }

  @observable public grid: MainSubStructureModel<RowT, SubRowT>;

  @observable public programme: NormalProgramme;
}

@observer
export class SearchListStructure<RowT, SubRowT> extends Component<{ store: SearchListModal<RowT, SubRowT>; className?: string; style?: CSSProperties; }> {
  render(): ReactNode {
    const { store: { programme, grid }, className = '', style = {}} = this.props;
    return (
      <div
        className={`${styles.searchListStructure} ${className}`}
        style={style}
      >
        <div className={`${styles.pd8} ${styles.bgf} ${styles.filter}`}>
          <NormalProgrammeComponent store={programme}/>
        </div>
        <div className={`${styles.flex1} ${styles.mt4}`}>
          <MainSubStructure store={grid}/>
        </div>
      </div>
    );
  }
}
