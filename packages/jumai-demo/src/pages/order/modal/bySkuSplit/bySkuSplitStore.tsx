import { message } from 'antd';
import type { FormInstance } from 'antd';
import { renderModal } from 'jumai-common';
import type { BaseData, PureData, BatchReportData } from 'jumai-utils';
import { EgGridModel, ImgFormatter, request, BatchReport } from 'jumai-utils';
import _ from 'lodash';
import { observable, action, toJS, runInAction } from 'mobx';
import qs from 'qs';
import React from 'react';
import { api } from '../../../../utils/api';

export default class BySkuSplitStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public confirmLoading = false;

  @observable public parent;

  @observable public orderIds;

  @observable public bySkuSplitVisible = false;

  @observable public queryRef = React.createRef<FormInstance>();

  @action public handleQuery = (queryParams): Promise<unknown> => {
    this.productGrid.resetAllSelectedRows();
    const formInfo = this.queryRef.current?.getFieldsValue();
    const { key, value } = formInfo;
    const data = { [key]: value };
    Object.assign(data, queryParams);
    return request<BaseData<PureData>>({
      url: api.querySkuV2,
      method: 'POST',
      data,
    }).then((res) => {
      this.productGrid.rows = res.data.list;
      this.productGrid.total = res.data.totalCount;
    });
  };

  // 查询商品
  @action public queryProductList = (): void => {
    this.productGrid.rows = [];
    this.productGrid.resetAllSelectedRows();
    const data = {
      page: this.productGrid.current,
      pageSize: this.productGrid.pageSize,
    };
    this.handleQuery(data);
  };

  @observable public productGrid = new EgGridModel({
    columns: [
      {
        key: 'productName',
        name: '商品名称',
        width: 100,
      },
      {
        key: 'skuNo',
        name: 'SKU编码',
        width: 120,
      },
      {
        key: 'barCode',
        name: '条形码',
        width: 100,
      },
      {
        key: 'productNo',
        name: '商品编码',
        width: 120,
      },
      {
        key: 'pic',
        name: '图片',
        width: 80,
        formatter: ({ row }) => {
          return (
            <ImgFormatter
              height={60}
              value={row.pic}
              width={60}
            />
          );
        },
      },
      {
        key: 'colorType',
        name: '颜色',
        width: 60,
      },
      {
        key: 'sizeType',
        name: '尺码',
        width: 60,
      },
      {
        key: 'costPrice',
        name: '成本价',
        width: 100,
      },
      {
        key: 'salePrice',
        name: '销售价',
        width: 100,
      },
    ].map((col) => ({
      ...col,
      resizable: true,
    })),
    rows: [],
    gridIdForColumnConfig: 'tsEgenieTsOmsOrderSplitProductBySkuTable',
    showCheckBox: true,
    primaryKeyField: 'id',
    api: {
      onQuery: this.handleQuery,
      onPageChange: (page, pageSize) => this.handleQuery({
        page,
        pageSize,
      }),
    },
  });

  // 打开商品弹窗
  @action public openModal = (orderIds: string): void => {
    this.orderIds = orderIds;
    this.bySkuSplitVisible = true;
  };

  // 关闭商品弹窗
  @action public closeModal = (): void => {
    this.queryRef.current?.resetFields();
    this.productGrid.resetAllSelectedRows();
    this.productGrid.rows = [];
    this.bySkuSplitVisible = false;
    this.confirmLoading = false;
  };

  // sku拆分操作
  @action public handleBySkuSplit = (): void => {
    const skuIds = Array.from(this.productGrid.selectedIds).join(',');

    if (!skuIds) {
      message.warn('请选择SKU!');
      return;
    }
    if (this.confirmLoading) {
      return;
    }
    this.confirmLoading = true;

    const data = {
      orderIds: this.orderIds,
      skuIds,
    };

    request<BatchReportData>({
      url: api.skuSplit,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      data: qs.stringify(data),
    }).then((res) => {
      this.closeModal();
      this.handleShowFailDialog(res);
      this.parent.resetTable();
    })
      .finally(() => {
        runInAction(() => {
          this.confirmLoading = false;
        });
      });
  };

  private handleShowFailDialog = (data): void => {
    renderModal(
      <BatchReport
        {...data.data}
        columns={[
          {
            title: '订单编号',
            dataIndex: 'saleOrderNo',
          },
          {
            title: '失败原因',
            dataIndex: 'reason',
          },
        ]}
      />
    );
  };
}
