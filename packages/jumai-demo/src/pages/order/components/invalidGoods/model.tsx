import { observable, action } from 'mobx';
import type { DrawerProps } from 'antd';
import React from 'react';
import { Button, message, Space, Tooltip } from 'antd';
import styles from './index.less';
import type { Store as ParentStore } from '../../store';
import type { BaseData } from 'jumai-utils';
import { MainSubStructureModel, NormalProgramme, request } from 'jumai-utils';
import AddProductModel from '../addProduct/model';

export default class InvalidGoodsModel {
  constructor(parent: ParentStore) {
    this.parent = parent;
    this.__init__();
  }

  @observable private open = false;

  @observable public addProductModel: AddProductModel;

  @observable public normalProgramme: NormalProgramme;

  @observable public mainSubStructureModel: MainSubStructureModel;

  public parent: ParentStore;

  @action
  private __init__() {
    this.initMainSubStructureModel();
    this.initNormalProgramme();
    this.addProductModel = new AddProductModel(this);
  }

  @action
  public replacementGoods = async(params) => {
    const req = await request<BaseData>({
      method: 'POST',
      url: '/api/saleorder/rest/order/matchSkuByPlatformSku',
      data: params,
    });
    message.success(req.info);
    this.normalProgramme.handleSearch();
  };

  @action
  public initNormalProgramme() {
    this.normalProgramme = new NormalProgramme(
      {
        filterItems: [
          {
            type: 'input',
            field: 'numIid',
            label: '平台商品ID',
          },
          {
            type: 'input',
            field: 'platformSkuId',
            label: '平台SKUID',
          },
        ],
        count: 3,
        handleSearch: () => {
          return this.mainSubStructureModel.onQuery();
        },
      }
    );
  }

  @action
  public initMainSubStructureModel() {
    this.mainSubStructureModel = new MainSubStructureModel(
      {
        grid: {
          columns: [
            {
              key: 'operation',
              name: '操作',
              formatter: ({ row }) => {
                return (
                  <Button
                    onClick={() => {
                      this.addProductModel.openAddProductModal(async(skuId) => {
                        await this.replacementGoods({
                          skuId,
                          platformSkuId: row.platformSkuId,
                          shopId: row.shopId,
                        });
                      });
                    }}
                    style={{ padding: 0 }}
                    type="link"
                  >
                    手动替换
                  </Button>
                );
              },
            },
            {
              key: 'shopName',
              name: '店铺',
              minWidth: 130,
            },
            {
              key: 'platformSkuId',
              name: '平台SKUID',
              minWidth: 130,
            },
            {
              key: 'skuPropertiesName',
              name: '网店规格',
              minWidth: 130,

            },
            {
              key: 'orderNum',
              name: '订单数',
            },
            {
              key: 'numIid',
              name: '平台商品ID',
              minWidth: 160,
            },
            {
              key: 'platformProductName',
              name: '平台商品名称',
              minWidth: 160,
              formatter: ({ row }) => {
                return (
                  <Tooltip title={row.platformProductName}>
                    {row.platformProductName}
                  </Tooltip>
                );
              },
            },
          ].map((item) => ({
            ...item,
            resizable: true,
          })),
          primaryKeyField: 'platformSkuId',
          showCheckBox: false,
          showSelectedTotal: false,
          showReset: false,
          showRefresh: false,
        },
        api: {
          onQuery: (param) => {
            const {
              filterParams,
              ...rest
            } = param;
            const newFilterParams = this.normalProgramme.filterItems.params;
            return request({
              url: '/api/saleorder/rest/order/queryNotMatchSkuPlatformSkuSum',
              method: 'POST',
              data: {
                ...rest,
                ...newFilterParams,
              },
            });
          },
        },
        hiddenSubTable: true,
      }
    );
  }

  @action
  public onOpen = () => {
    this.open = true;
    this.normalProgramme.handleSearch();
  };

  @action
  private onOk = () => {
    console.log('onOk');
  };

  @action
  private onClose = () => {
    this.open = false;
    this.normalProgramme.reset();
    this.mainSubStructureModel.gridModel.clearToOriginal();
  };

  public get getDrawerProps(): DrawerProps {
    return {
      open: this.open,
      width: 888,
      title: '批量替换无效商品',
      onClose: this.onClose,
      footer: (
        <Space className={styles.footer}>
          <Button onClick={this.onClose}>
            取消
          </Button>
          <Button
            onClick={this.onClose}
            type="primary"
          >
            保存
          </Button>
        </Space>
      ),
    };
  }
}
