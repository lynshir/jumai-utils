import type { FormInstance } from 'antd';
import { renderModal } from 'jumai-common';
import type { BaseData, PureData } from 'jumai-utils';
import { EgGridModel, ImgFormatter, request, BatchReport } from 'jumai-utils';
import { observable, action } from 'mobx';
import React from 'react';
import type InvalidGoodsModel from '../invalidGoods/model';
import { message, Tooltip } from 'antd';

export default class AddProductModel {
  constructor(parent: InvalidGoodsModel) {
    this.parent = parent;
    this.__init__();
  }

  @observable public parent: InvalidGoodsModel;

  @observable public addProductVisible = false;

  @observable public confirmLoading = false;

  @observable public queryRef = React.createRef<FormInstance>();

  @observable public productGrid: EgGridModel<any>;

  public callback: (skuId: number) => Promise<void>;

  @action
  public onOk = async() => {
    const selectedIds = Array.from(this.productGrid.selectedIds);
    if (selectedIds.length !== 1) {
      message.warning('请选择一条商品进行替换！');
      return;
    }
    try {
      this.confirmLoading = true;
      this.callback && await this.callback(Number(selectedIds[0]));
      this.onCancel();
    } catch (e) {
      console.error(e);
    } finally {
      this.confirmLoading = false;
    }
  };

  @action public handleQuery = (queryParams): Promise<unknown> => {
    try {
      this.productGrid.resetAllSelectedRows();
      const formInfo = this.queryRef.current?.getFieldsValue();
      let data = {};
      if (formInfo) {
        const { key, value } = formInfo;
        data = {
          [key]: value,
          skuType: formInfo.skuType ? '1' : '0',
        };
      }

      Object.assign(data, queryParams);
      return request<BaseData<PureData>>({
        url: '/api/oms/rest/sku/v2/skuList',
        method: 'POST',
        data,
      }).then((res) => {
        this.productGrid.rows = res.data.list;
        this.productGrid.total = res.data.totalCount;
      });
    } catch (e) {
      console.log(`查询商品列表出错${e}`);
      return null;
    }
  };

  // 查询商品
  @action public queryProductList = () => {
    this.productGrid.rows = [];
    this.productGrid.resetAllSelectedRows();
    const data = {
      page: this.productGrid.current,
      pageSize: this.productGrid.pageSize,
    };
    this.handleQuery(data);
  };

  private handlePageChange = (page: number, pageSize: number): void => {
    this.handleQuery({
      page,
      pageSize,
    });
  };

  @action
  public __init__() {
    this.productGrid = new EgGridModel({
      columns: [
        {
          key: 'productName',
          name: '商品名称',
          minWidth: 120,
          formatter: ({ row }) => {
            return (
              <Tooltip title={row.productName}>
                {row.productName}
              </Tooltip>
            );
          },
        },
        {
          key: 'pic',
          name: '图片',
          formatter: ({ row }) => {
            return (
              <ImgFormatter
                value={row.pic}
                width={30}
              />
            );
          },
        },
        {
          key: 'productNo',
          name: '商品编码',
          formatter: ({ row }) => {
            return (
              <Tooltip title={row.productNo}>
                {row.productNo}
              </Tooltip>
            );
          },
        },
        {
          key: 'skuNo',
          name: 'SKU编码',
          formatter: ({ row }) => {
            return (
              <Tooltip title={row.skuNo}>
                {row.skuNo}
              </Tooltip>
            );
          },
        },
        {
          key: 'barCode',
          name: '条形码',
        },
        {
          key: 'colorType',
          name: '颜色',
        },
        {
          key: 'sizeType',
          name: '尺码',
        },
        {
          key: 'costPrice',
          name: '成本价',
        },
        {
          key: 'salePrice',
          name: '销售价',
        },
      ].map((item) => ({
        resizable: true,
        ...item,
      })),
      rows: [],
      primaryKeyField: 'id',
      showCheckBox: true,
      showQuickJumper: false,
      showRefresh: false,
      api: {
        onQuery: this.handleQuery,
        onPageChange: this.handlePageChange,
        onShowSizeChange: this.handlePageChange,
      },
    });
  }

  // 打开商品弹窗
  @action public openAddProductModal = (callback?: (skuId: number) => Promise<void>): void => {
    this.addProductVisible = true;
    if (callback) {
      this.callback = callback;
    }
    this.queryProductList();
  };

  // 关闭商品弹窗
  @action public onCancel = (): void => {
    this.queryRef.current?.resetFields();
    this.callback = undefined;
    this.productGrid.resetAllSelectedRows();
    this.productGrid.rows = [];
    this.productGrid.pageSize = 50;
    this.productGrid.total = 0;
    this.productGrid.current = 1;
    this.addProductVisible = false;
    this.confirmLoading = false;
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
