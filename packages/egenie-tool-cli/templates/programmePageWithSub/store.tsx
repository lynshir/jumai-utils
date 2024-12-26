import type { BaseData, PaginationData } from 'egenie-utils';
import { MainSubStructureModel, Programme, request } from 'egenie-utils';
import { action, observable } from 'mobx';
import { Space, Button } from 'antd';
import { MAIN_COLUMNS, SUB_COLUMNS } from './constant';
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
          key: 'operation',
          name: '操作',
          width: 200,
          formatter: ({ row }) => {
            return (
              <Space size="small">
                <a type="link">
                  日志
                </a>
                <a type="link">
                  删除
                </a>
              </Space>
            );
          },
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
    subTables: {
      activeTab: 'log',
      tabsFlag: {
        inited: {
          detail: true,
          skuDetail: false,
          log: false,
        },
        searched: {},
      },
      list: [
        {
          tab: {
            name: '日志',
            value: 'log',
          },
          grid: {
            columns: [
              {
                key: 'date',
                name: '操作时间',
                width: 220,
              },
            ].map((info) => ({
              resizable: true,
              sortable: false,
              ...info,
            })),
            rows: [],
            primaryKeyField: 'id',
            sortByLocal: false,
            showCheckBox: false,
            showSelectedTotal: false,
            setColumnsDisplay: true,
            gridIdForColumnConfig: 'tsSingleReceivableLogSubTable',
          },
          api: {
            onQuery: ({
              data,
              pid,
            }) => {
              return request<PaginationData<any>>({
                method: 'POST',
                url: '/api/tst',
                data: {
                  ...data,
                  id: pid,
                },
              });
            },
          },
        },
      ],
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
