import { observable, action, computed, autorun } from 'mobx';
import type { BaseData, PaginationData } from 'jumai-utils';
import { EgGridModel, request, ImgFormatter } from 'jumai-utils';
import React from 'react';
import { message } from 'antd';
import type { RadioChangeEvent, FormInstance } from 'antd';
import type { OrderProduct, IFormValues, Vendor, VendorProduct, VendorProductDetail } from './interface';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';

export enum TAB_ITEMS {
  platformSkuId = 'platformSkuId',
  skuId = 'skuId'
}

export default class MatchDropshipProductStore {
  constructor() {
    this.getVendorList();
    autorun(() => {
      this.grid.loading = this.queryLoading;
    });
  }

  @observable public visible = false;

  @observable public orderProduct: OrderProduct = null;

  @observable public activeTabKey = TAB_ITEMS.skuId;

  @observable public queryLoading = false;

  @observable public submitLoading = false;

  // 档口列表
  @observable public vendorList: Array<{
    label: string;
    value: number;
  }> = [];

  // 是否匹配其他订单中相同商品
  @observable public matchOtherOrder = false;

  // 供应商商品各个颜色尺码sku列表
  @observable public vendorProductSkuList: VendorProductDetail[] = [];

  @observable public selectedColor: string = null;

  @observable public selectedSize: string = null;

  // 供应商商品颜色列表
  @computed public get vendorProductColorOptions() {
    return this.vendorProductSkuList.map((i) => ({
      label: i.color,
      value: i.color,
    }));
  }

  // 供应商商品尺码列表，选中尺码后才能确定sku
  @computed public get vendorProductSizeOptions() {
    const skuList = this.vendorProductSkuList.find((i) => i.color === this.selectedColor)?.skuList ?? [];
    return skuList.map((i) => ({
      label: i.size,
      value: i.size,
    }));
  }

  // 选中的供应商商品
  @computed public get selectedVendorProduct() {
    const skuList = this.vendorProductSkuList.find((i) => i.color === this.selectedColor)?.skuList ?? [];
    return skuList.find((i) => i.size === this.selectedSize);
  }

  public queryFormRef = React.createRef<FormInstance<IFormValues>>();

  public grid = new EgGridModel<VendorProduct>({
    columns: [
      {
        name: '图片',
        key: 'mainPicUrl',
        formatter: ({ row }) => {
          return (
            <ImgFormatter
              src={row.mainPicUrl}
            />
          );
        },
      },
      {
        name: '档口名称',
        key: 'vendorShopName',
      },
      {
        name: '衫海精商品名称',
        key: 'goodsName',
      },
      {
        name: '衫海经款式货号',
        key: 'goodsNo',
      },
      {
        name: '拿货价',
        key: 'costPriceStr',
      },
    ],
    primaryKeyField: 'goodsId',
    showCheckBox: false,
    showSelectedTotal: false,
    setColumnsDisplay: true,
    gridIdForColumnConfig: 'tsEgenieTsOmsOrderDetailMatchPropshipProductTable',
    api: {
      onPageChange: () => this.searchProduct(),
      onShowSizeChange: () => this.searchProduct(),
      onRowClick: (_, row) => this.onClickRow(row),
    },
  });

  @action
  public onActiveTabKeyChange = (activeKey: TAB_ITEMS) => {
    this.activeTabKey = activeKey;
  };

  @action
  public show = (row: OrderProduct) => {
    this.visible = true;
    this.orderProduct = row;
  };

  @action
  public close = () => {
    this.grid.clearToOriginal();
    this.queryFormRef.current.resetFields();
    this.activeTabKey = TAB_ITEMS.skuId;
    this.matchOtherOrder = false;
    this.orderProduct = null;
    this.vendorProductSkuList = [];
    this.selectedColor = null;
    this.selectedSize = null;
    this.visible = false;
  };

  // 获取档口列表
  @action
  public getVendorList = (shopNo?: string) => {
    request<PaginationData<Vendor>>({
      url: '/api/mall/operation/rest/rest/common/enable/shop/item/page/list',
      method: 'POST',
      data: {
        page: 1,
        pageSize: 200,
        shopNo,
      },
    })
      .then((response) => {
        if (Array.isArray(response?.data?.list)) {
          this.vendorList = response.data.list.map((i) => ({
            label: i.shopNo,
            value: i.id,
          }));
        }
      });
  };

  // 查询商品列表
  @action
  public searchProduct = async() => {
    if (this.queryLoading) {
      return;
    }
    const formValues = this.queryFormRef.current.getFieldsValue();
    if (Object.values(formValues).filter((i) => Boolean(i?.toString().trim())).length === 0) {
      message.error('请填写查询条件！');
      return;
    }
    try {
      this.queryLoading = true;
      const { data } = await request<PaginationData<VendorProduct>>({
        url: '/api/gms/pc/style/pageVendorTenantGoods',
        method: 'POST',
        data: {
          page: this.grid.current,
          pageSize: this.grid.pageSize,
          ...formValues,
        },
      });
      this.grid.rows = data.list;
      this.grid.total = data.totalCount;
    } finally {
      this.queryLoading = false;
    }
  };

  // 点击表格行获取商品各个颜色尺码sku
  private onClickRow = async(row: VendorProduct) => {
    // 调用表格的clearToOriginal方法会触发onRowClick
    if (row.goodsId) {
      const { data } = await request<BaseData<VendorProductDetail>>({
        url: '/api/gms/goods/listPosGoodsSku4Match',
        method: 'POST',
        data: { posGoodsId: row.goodsId },
      });
      if (Array.isArray(data)) {
        this.vendorProductSkuList = data;
        this.selectedColor = null;
        this.selectedSize = null;
      }
    }
  };

  public onColorChange = (e: RadioChangeEvent) => {
    this.selectedColor = e.target.value;
    this.selectedSize = null;
  };

  public onSizeChange = (e: RadioChangeEvent) => {
    this.selectedSize = e.target.value;
  };

  public onMatchOtherOrderCheckboxChange = (e: CheckboxChangeEvent) => {
    this.matchOtherOrder = e.target.checked;
  };

  public onSubmit = async() => {
    if (!this.grid.cursorRow || !this.selectedVendorProduct) {
      message.error('请选择匹配代发商品！');
      return;
    }
    const data: any = {
      goodsSkuId: this.selectedVendorProduct.posGoodsSkuId,
      vendorShopId: this.grid.cursorRow.vendorShopId,
      otherOrders: this.matchOtherOrder,
      saleOrderId: this.orderProduct.sale_order_id,
    };
    if (this.activeTabKey === TAB_ITEMS.platformSkuId) {
      data.platformSkuId = this.orderProduct.platform_sku_id;
    } else {
      data.skuId = this.orderProduct.sku_id;
    }
    try {
      this.submitLoading = true;
      await request({
        url: '/api/saleorder/rest/proxySend/goodsSku/update',
        method: 'POST',
        data,
      });
      message.success('操作成功！');
      this.close();
    } finally {
      this.submitLoading = false;
    }
  };
}
