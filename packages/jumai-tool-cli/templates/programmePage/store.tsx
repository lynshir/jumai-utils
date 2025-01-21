import type { BaseData, PaginationData } from 'jumai-utils';
import { MainSubStructureModel, Programme, request } from 'jumai-utils';
import { action, observable } from 'mobx';
import styles from './index.less';
import React from 'react';

export default class Store {
  // 主表内容
  public mainSubStructureModel = new MainSubStructureModel({
    pageId: '',
    buttons: [
      {
        text: '邀请供应商',
        handleClick: () => {
          //
        },
      },
    ],
    grid: {
      primaryKeyField: 'id',
      columns: [
        {
          key: 'vendorName',
          name: '供应商名称',
          width: 200,
        },
      ].map((v) => ({
        resizable: true,
        sortable: false,
        ...v,
      })),
      rows: [],
      forceRowClick: false,
      showCheckBox: true,
      sortByLocal: false,
      showEmpty: true,
      pageSize: 50,
      setColumnsDisplay: true,
      gridIdForColumnConfig: 'gridIdForColumnConfig',
    },
    hiddenSubTable: true,
    api: {
      onQuery: (params) => {
        const {
          filterParams,
          ...rest
        } = params;
        console.log('params...', params);
        const postParams = { ...filterParams };
        if (filterParams.dateValue) {
          const startDate = filterParams.dateValue.split(',')[0];
          const endDate = filterParams.dateValue.split(',')[1];
          postParams.startDate = startDate;
          postParams.endDate = endDate;
          delete postParams.dateValue;
          delete postParams.dateType;
        }

        return request<PaginationData<any>>({
          url: '/test',
          method: 'post',
          data: {
            ...postParams,
            ...rest,
          },
        });
      },
    },

  });

  public programme = new Programme({
    gridModel: this.mainSubStructureModel,
    filterItems: [
      {
        type: 'date',
        field: 'time',
        label: '日期类型',
        selectValue: 'createTime',
        data: [
          {
            value: 'createTime',
            label: '合作时间',
          },
        ],
      },
    ],
    moduleName: 'moduleName',
    showProgrammeCount: true,
  });
}
