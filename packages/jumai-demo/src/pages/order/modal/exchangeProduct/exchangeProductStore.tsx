import { message, Modal, Radio } from 'antd';
import type { FormInstance } from 'antd';
import type { BaseData, PureData } from 'jumai-utils';
import { EgGridModel, ImgFormatter, request } from 'jumai-utils';
import _ from 'lodash';
import { observable, action, toJS } from 'mobx';
import React from 'react';
import { api } from '../../../../utils/api';
import { IOperationRes } from '../../interface';

export default class ProductStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public exchangeProductVisible = false;

  @observable public detailId;

  @observable public orderId;

  @observable public warehouseId;

  @observable public originSkuId;// 原sku

  @observable public queryRef = React.createRef<FormInstance>();

  @observable public submitLoading = false;

  @action public handleQuery = (queryParams): Promise<unknown> => {
    try {
      this.productGrid.resetAllSelectedRows();
      const formInfo = this.queryRef.current?.getFieldsValue();
      const { skuType, ...rest } = formInfo;
      const data = {
        ...rest,
        skuType: formInfo.skuType ? '1' : '0',
      };
      Object.assign(data, queryParams);
      return request<BaseData<PureData>>({
        url: api.querySkuV2,
        method: 'POST',
        data,
      }).then((res) => {
        this.productGrid.rows = res.data.list;
        this.productGrid.total = res.data.totalCount;
      });
    } catch (e) {
      console.log(`请求商品列表失败${e}`);
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

  @observable public productGrid = new EgGridModel({
    columns: [
      // {
      //   key: 'operate',
      //   name: '',
      //   width: 10,
      //   formatter: ({ row }) => {
      //     return (<Radio/>);
      //   },
      // },
      {
        key: 'productName',
        name: '商品名称',
        width: 150,
      },
      {
        key: 'pic',
        name: '图片',
        width: 80,
        formatter: ({ row }) => {
          return (
            <ImgFormatter
              value={row.pic}
            />
          );
        },
      },
      {
        key: 'productNo',
        name: '商品编码',
        width: 150,
      },
      {
        key: 'skuNo',
        name: 'SKU编码',
        width: 250,
      },
      {
        key: 'barCode',
        name: '条形码',
        width: 150,
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
      },
      {
        key: 'saleStock',
        name: '库存',
      },
    ].map((item) => ({
      resizable: true,
      ...item,
    })),
    rows: [],
    primaryKeyField: 'id',
    showReset: false,
    showSelectedTotal: false,
    gridIdForColumnConfig: 'tsEgenieTsOmsOrderExchangeProductModalTable',
    setColumnsDisplay: true,
    api: {
      onQuery: this.handleQuery,
      onPageChange: this.handlePageChange,
      onShowSizeChange: this.handlePageChange,
    },
  });

  // 打开商品弹窗
  @action public openExchangeProductModal = (productNo, skuId, detailId, warehouseId, orderId): void => {
    this.exchangeProductVisible = true;
    this.detailId = detailId;
    this.orderId = orderId;
    this.originSkuId = skuId;
    this.warehouseId = warehouseId;
    this.queryRef.current?.setFieldsValue({productNo});
    this.queryRef.current?.setFieldsValue({warehouseId});
    this.queryProductList();

    // 在界面首次渲染中，不能保证 ref 可以获取到(解决方案:在view层将form放在modal外面或者给modal加上forceRender)
    // setTimeout(() => {
    //   this.queryRef.current?.setFieldsValue({
    //     key: 'productNo',
    //     value: productNo,
    //   });
    //   this.queryProductList();
    // });
  };

  // 关闭商品弹窗
  @action public closeExchangeProcutModal = (): void => {
    this.queryRef.current?.resetFields();
    this.productGrid.resetCursorRow();
    this.productGrid.resetAllSelectedRows();
    this.productGrid.pageSize = 50;
    this.productGrid.current = 1;
    this.orderId = null;
    this.detailId = null;
    this.productGrid.rows = [];
    this.exchangeProductVisible = false;
  };

  // 提交交换商品
  @action public handleExchangeProduct = async() => {
    if (this.submitLoading) {
      return;
    }

    const ids = Array.from(this.productGrid.selectedIds);
    if (!ids.length) {
      message.warning('请选择要更换的商品');
      return;
    }

    if (ids.length > 1) {
      await new Promise<void>((resolve, reject) => {
        Modal.confirm({
          title: '您勾选了多条商品，是否确认更换？',
          onOk: () => resolve(),
          onCancel: () => reject(),
          zIndex: 9999,
        });
      });
    }

    if (ids.includes(this.originSkuId)) {
      message.warning('与替换前商品是同一商品,无需替换');
      return;
    }
    const data = {
      detailId: this.detailId,
      orderId: Number(this.orderId),
      skuIds: ids,
    };
    try {
      this.submitLoading = true;
      await request<BaseData>({
        url: api.changeProduct,
        method: 'POST',
        data,
      }).then((res) => {
        message.success('操作成功');
        if (this?.parent?.orderDetailsModel?.visible) {
          this.parent.orderDetailsModel.onRefreshGoods();
          this.closeExchangeProcutModal();
          return;
        }
        this.parent.productDetailStore.initProductInfo(this.orderId, this.parent.mainGridModel.gridModel.cursorRow);
        this.closeExchangeProcutModal();
      });
    } finally {
      this.submitLoading = false;
    }
  };
}
