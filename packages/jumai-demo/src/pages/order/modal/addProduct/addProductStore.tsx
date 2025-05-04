import { Button, message, InputNumber, Modal } from 'antd';
import type { FormInstance } from 'antd';
import { renderModal } from 'jumai-common';
import type { BaseData, PureData } from 'jumai-utils';
import { EgGridModel, ImgFormatter, request, BatchReport } from 'jumai-utils';
import _ from 'lodash';
import { observable, action, toJS, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { api } from '../../../../utils/api';
import type { IOperationRes } from '../../interface';
import styles from './index.less';

export default class ProductStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public addProductVisible = false;

  @observable public noAddRequest = false;

  @observable public confirmLoading = false;

  @observable public queryRef = React.createRef<FormInstance>();

  @observable public targetIds = [];// 目标表中的id

  @action public handleQuery = (queryParams): Promise<unknown> => {
    try {
      this.productGrid.resetAllSelectedRows();
      const formInfo = this.queryRef.current?.getFieldsValue();
      const { key, value } = formInfo;
      const data = {
        [key]: value,
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

  @observable public productGrid = new EgGridModel({
    columns: [
      {
        key: 'oeration',
        name: '操作',
        formatter: ({ row }) => {
          return (
            <Button
              className={styles.operationBtn}
              onClick={() => {
                this.addProduct(row);
              }}
              type="link"
            >
              添加
            </Button>
          );
        },
        frozen: true,
        width: 80,
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
        key: 'skuNo',
        name: 'SKU编码',
        width: 140,
      },
      {
        key: 'colorType',
        name: '颜色',
        width: 80,
      },
      {
        key: 'sizeType',
        name: '尺码',
        width: 80,
      },
      {
        key: 'productNo',
        name: '商品编码',
        width: 120,
      },
      {
        key: 'productName',
        name: '商品名称',
        width: 120,
      },

      // {
      //   key: 'barCode',
      //   name: '条形码',
      //   width: 100,
      // },
      {
        key: 'costPrice',
        name: '成本价',
        width: 80,
      },
      {
        key: 'salePrice',
        name: '销售价',
        width: 80,
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

  @observable public targetGrid = new EgGridModel({
    columns: [
      {
        key: 'oeration',
        name: '操作',
        formatter: ({ row }) => {
          return (
            <Button
              className={styles.operationBtn}
              onClick={() => {
                this.deleteProduct(row.id);
              }}
              type="link"
            >
              删除
            </Button>
          );
        },
        frozen: true,
        width: 80,
      },
      {
        key: 'num',
        name: '数量',
        width: 80,
        formatter: observer(({ row }) => {
          return (
            <InputNumber
              id={`id_${row.id}`}
              min={1}
              onChange={(value) => {
                this.handleChange(value, row.id);
              }}

              style={{ width: '100%' }}
              value={row.num}
            />
          );
        }),
      },
      {
        key: 'pic',
        name: '图片',
        width: 80,
        formatter: ({ row }) => {
          return (
            <ImgFormatter
              height={30}
              value={row.pic}
              width={30}
            />
          );
        },
      },
      {
        key: 'skuNo',
        name: 'SKU编码',
        width: 120,
      },
      {
        key: 'colorType',
        name: '颜色',
        width: 80,
      },
      {
        key: 'sizeType',
        name: '尺码',
        width: 80,
      },
      {
        key: 'productNo',
        name: '商品编码',
        width: 120,
      },
      {
        key: 'productName',
        name: '商品名称',
        width: 120,
      },

      // {
      //   key: 'barCode',
      //   name: '条形码',
      //   width: 100,
      // },
      {
        key: 'costPrice',
        name: '成本价',
        width: 80,
      },
      {
        key: 'salePrice',
        name: '销售价',
        width: 80,
      },
    ].map((item) => ({
      resizable: true,
      ...item,
    })),
    rows: [],
    primaryKeyField: 'id',
    showPager: false,
  });

  // 打开商品弹窗
  @action public openAddProductModal = (): void => {
    this.addProductVisible = true;
  };

  // 关闭商品弹窗
  @action public closeAddProcutModal = (): void => {
    this.queryRef.current?.resetFields();
    this.productGrid.resetAllSelectedRows();
    this.targetGrid.resetAllSelectedRows();
    this.noAddRequest = false;
    this.targetIds = [];
    this.productGrid.rows = [];
    this.productGrid.pageSize = 50;
    this.productGrid.total = 0;
    this.productGrid.current = 1;
    this.targetGrid.rows = [];
    this.addProductVisible = false;
    this.confirmLoading = false;
  };

  // 批量添加
  @action public batchAdd = (): void => {
    const { selectedIds = new Set() } = this.productGrid;
    const selectedArr = Array.from(selectedIds);
    if (!selectedArr.length) {
      message.warn('请至少选择一行');
      return;
    }

    // 找到当前新增的ids
    const currentSelectedIds = _.difference(selectedArr, Array.from(this.targetIds));

    // 找到重复添加的ids
    const alreadySelectedIds = _.intersection(selectedArr, Array.from(this.targetIds));

    const selectedRows = this.productGrid.selectRows; // 总表选中的行
    const targetRows = this.targetGrid.rows;// 目标表中的行

    // 当前新增的条
    currentSelectedIds.forEach((item) => {
      const chooseRow = selectedRows.find((row) => row.id == item);
      chooseRow.num = 1;
      this.targetGrid.rows.push(chooseRow);
    });

    // 重复新增的条
    alreadySelectedIds.forEach((item) => {
      const chooseRowIndex = targetRows.findIndex((row) => row.id === item);
      this.targetGrid.rows[chooseRowIndex].num++;
    });

    this.targetIds = this.targetGrid.rows.map((item) => item.id);
    this.targetGrid.resetAllSelectedRows();
  };

  // 目标表删除
  @action public deleteProduct = (id): void => {
    const deletedIndex = this.targetGrid.rows.findIndex((item) => item.id === id);
    this.targetGrid.rows.splice(deletedIndex, 1);
    this.targetIds = this.targetGrid.rows.map((item) => item.id);
  };

  // 批量删除
  @action public batchDelete = () => {
    this.targetGrid.selectRows.forEach((item) => {
      const deletedIndex = this.targetGrid.rows.findIndex((el) => el.id === item.id);
      this.targetGrid.rows.splice(deletedIndex, 1);
    });
    this.targetIds = this.targetGrid.rows.map((item) => item.id);
    this.targetGrid.resetAllSelectedRows();
  };

  // 商品表添加
  @action public addProduct = (row): void => {
    const addIndex = this.targetGrid.rows.findIndex((item) => item.id === row.id);
    if (addIndex === -1) {
      // 直接新增条
      const newRow = Object.assign(row, { num: 1 });
      this.targetGrid.rows.push(newRow);
    } else {
      this.targetGrid.rows[addIndex].num++;
    }
    this.targetIds = this.targetGrid.rows.map((item) => item.id);
  };

  @action public handleChange = (val, id) => {
    const modifiedIndex = this.targetGrid.rows.findIndex((item) => item.id === id);
    this.targetGrid.rows[modifiedIndex].num = val;
  };

  // 提交添加商品
  @action public handleAddProduct = (): void => {
    // 判断目标表是否为空
    const targetRows = this.targetGrid.rows;
    if (!targetRows.length) {
      message.warn('请添加商品');
      return;
    }

    // 检测是否有数量未填写
    const validNum = targetRows.every((item) => item.num);
    if (!validNum) {
      message.warn('请填写数量');
      return;
    }

    // 不发送添加商品请求(用于新建订单)
    if (this.noAddRequest) {
      this.parent.orderStore.addSelectedProduct(targetRows);
      this.closeAddProcutModal();
      return;
    }
    if (this.confirmLoading) {
      return;
    }
    this.confirmLoading = true;

    const ids = Array.from(this.parent.mainGridModel.gridModel.selectedIds).toString();
    const detailParams = targetRows.map((item) => ({
      num: item.num,
      skuId: item.id,
    }));
    request<BaseData<IOperationRes>>({
      url: api.addProduct,
      method: 'POST',
      data: {
        ids,
        detailParams,
      },
    }).then((res) => {
      this.handleShowFailDialog(res);

      // 给多条订单添加商品(不刷新商品列表,刷新主表)
      if (this.parent.mainGridModel.gridModel.selectedIds.size > 1) {
        this.closeAddProcutModal();
        this.parent.resetTable();
        return;
      }

      // 订单详情中添加商品(重新请求订单详情数据)
      if (this.parent?.orderDetailsModel?.visible) {
        this.parent?.orderDetailsModel?.onRefreshGoods();
        this.closeAddProcutModal();
        return;
      }

      // 商品详情中添加商品
      this.parent.productDetailStore.initProductInfo(ids, this.parent.mainGridModel.gridModel.cursorRow);
      this.closeAddProcutModal();
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
