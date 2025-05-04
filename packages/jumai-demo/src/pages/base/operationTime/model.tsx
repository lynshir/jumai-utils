import { Tooltip } from 'antd';
import { EgGridModel, request } from 'jumai-utils';
import type { ColumnType, PaginationData } from 'jumai-utils';
import { action } from 'mobx';
import moment from 'moment';
import React from 'react';

// import parentModel from '../../order/orderDetails/model';

export default class {
  constructor(parent) {
    this.parent = parent;
    this._init();
  }

  public parent;

  public egGridModel: EgGridModel;

  public getColumns: ColumnType = [
    {
      key: 'moduleType',
      name: '操作模块',
      width: 120,
    },
    {
      key: 'operationType',
      name: '操作名称',
      width: 200,
    },
    {
      key: 'operationResult',
      name: '操作结果',
      formatter: ({ row }) => {
        return (
          <Tooltip
            placement="topLeft"
            title={row.operationResult}
          >
            <span>
              {row.operationResult}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: 'lastUpdated',
      name: '操作时间',
      width: 150,
      formatter: ({ row }) => {
        return (
          <div>
            {moment(row.lastUpdated)
              .format('YYYY-MM-DD HH:mm:ss')}
          </div>
        );
      },
    },
    {
      key: 'operatorShowName',
      name: '操作人',
      wodth: 200,
    },
  ].map((item) => {
    return {
      resizable: true,
      ...item,
    };
  });

  @action
  public getOrderLog = async() => {
    this.egGridModel.loading = true;
    try {
      const queryParam = this.egGridModel.queryParam;

      // const _queryParams = [`id=${this.parent.orderId}`];

      // Object.keys(queryParam).forEach((item) => {
      //   _queryParams.push(`${item}=${queryParam[item]}`);
      // });
      const url = '/api/saleorder/rest/log/queryOrderLogsById';
      const req = await request<PaginationData>({
        method: 'POST',
        url,
        data: {
          ...queryParam,
          id: this.parent.orderId,
        },
      });

      this.egGridModel.rows = req.data.list;
      this.egGridModel.total = req.data.totalCount;
    } catch (e) {
      console.error(e);
    } finally {
      this.egGridModel.loading = false;
    }
  };

  @action
  public _init = () => {
    this.egGridModel = new EgGridModel({
      columns: this.getColumns,
      rows: [],
      primaryKeyField: 'id',
      forceRowClick: true,
      showCheckBox: false,
      pageSize: 50,
      showSelectedTotal: false,
      showReset: false,
      gridIdForColumnConfig: 'tsEgenieTsOmsBaseOperationTimeTable',
      setColumnsDisplay: true,
      api: {
        onPageChange: this.getOrderLog,
        onShowSizeChange: this.getOrderLog,
        onRefresh: this.getOrderLog,
      },
    });
  };
}
