import type { BaseData, IMainSubStructureModel, NormalProgrammeParams } from 'egenie-utils';
import { request, SearchListModal } from 'egenie-utils';
import React from 'react';
import styles from './index.less';

export class Store {
  public filterset: Partial<NormalProgrammeParams> = {
    count: 6,
    filterItems: [
      {
        type: 'input',
        label: '查询条件1',
        field: 'key1',
      },
      {
        type: 'select',
        label: '查询条件2',
        field: 'key2',
        data: [],
      },
    ],
  };

  public grid: IMainSubStructureModel = {
    buttons: [
      {
        text: '导出',
        handleClick: () => {
          // todo
        },
      },
    ],
    grid: {
      showNormalEmpty: false,
      showNoSearchEmpty: true,
      showEmpty: false,
      columns: [
        {
          key: 'operation',
          name: '操作',
          width: 120,
          frozen: true,
          formatter: ({ row }) => {
            return (
              <>
                <span
                  className={styles.operationBtn}
                >
                  编辑
                </span>
                <span
                  className={styles.operationBtn}
                >
                  删除
                </span>
              </>
            );
          },
        },
        {
          key: 'column',
          name: '列1',
          width: 200,
        },
      ],
      rows: [],
      primaryKeyField: '',
      sortByLocal: false,
      showCheckBox: true,
    },
    hiddenSubTable: true,
    api: {
      onQuery: (params) => {
        const { filterParams, ...rest } = params;
        return request<BaseData<any>>({
          url: '/test',
          method: 'POST',
          data: {
            ...filterParams,
            ...rest,
          },
        });
      },
    },
  };

  public searchListStore = new SearchListModal({
    programme: this.filterset,
    grid: this.grid,
  });
}

