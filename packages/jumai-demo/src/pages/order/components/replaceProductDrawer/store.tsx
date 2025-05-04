import React from 'react';
import { observable, action } from 'mobx';
import type { PaginationData } from 'jumai-utils';
import { message } from 'antd';
import { MainSubStructureModel, request, ImgFormatter, NormalProgramme } from 'jumai-utils';
import type { Product } from './interface';
import { getStaticResourceUrl } from 'jumai-common';

export default class ReplaceProductStore {
  @observable public visible = false;

  @observable public loading = false;

  public normalProgramme = new NormalProgramme({
    filterItems: [

      {
        label: '原始商品',
        field: 'originSkuNo',
        type: 'input',
      },
    ],
    handleSearch: () => {
      this.mainSubStructureModel.gridModel.current = 1;
      return this.mainSubStructureModel.onQuery();
    },
    count: 2,
  });

  public mainSubStructureModel = new MainSubStructureModel<Product>({
    buttons: [],
    grid: {
      columns: [
        {
          name: '图片',
          key: 'pic',
          formatter: ({ row }) => {
            return row.pic ? (
              <ImgFormatter src={row.pic}/>
            ) : (
              <img
                src={getStaticResourceUrl('customer-source/noPic.png')}
                style={{
                  background: '#f3f3f3',
                  width: 30,
                  height: 30,
                }}
              />
            );
          },
        },
        {
          name: '原始商品',
          key: 'skuNo',
          minWidth: 150,
        },
        {
          name: '颜色',
          key: 'color',
        },
        {
          name: '尺码',
          key: 'size',
        },
        {
          name: '替换策略',
          key: 'strategyName',
          minWidth: 150,
        },
        {
          name: '待发订单数',
          key: 'orderNum',
        },
      ]?.map((item) => {
        return {
          draggable: true,
          resizable: true,
          ...item,
        };
      }),
      primaryKeyField: 'strategyId',
      gridIdForColumnConfig: 'orderSkuReplaceStrategyQueryRelatedOrderStrategyId',
    },
    hiddenSubTable: true,
    api: {
      onQuery: (params) => {
        const { page, pageSize } = params;
        const filterParams = this.normalProgramme.filterItems.params;
        return request<PaginationData<Product>>({
          url: '/api/saleorder/rest/orderSkuReplaceStrategy/queryRelatedOrder',
          method: 'POST',
          data: {
            page,
            pageSize,
            ...filterParams,
          },
        });
      },
    },
  });

  @action
  public show = () => {
    this.visible = true;
  };

  @action
  public close = () => {
    this.visible = false;
    this.normalProgramme.reset();
    this.mainSubStructureModel.gridModel.clearToOriginal();
  };

  // 打开商品替换策略页面
  public onClickTips = () => {
    window.top.egenie.openTabId(60206);
  };

  /**
   * 执行替换
   */
  @action
  public onSave = async() => {
    const selectedRows = this.mainSubStructureModel.gridModel.selectRows;
    if (selectedRows.length === 0) {
      message.error('请至少选择1个商品');
      return;
    }
    try {
      this.loading = true;
      const ids = selectedRows.map((i) => i.strategyId);
      await request({
        url: '/api/saleorder/rest/orderSkuReplaceStrategy/doReplaceSku',
        method: 'POST',
        data: { ids },
      });
      message.success('操作成功');
      this.close();
    } finally {
      this.loading = false;
    }
  };
}
