import React from 'react';
import { Button, Space, Modal, message, Tag, Popover } from 'antd';
import { observable, action, computed } from 'mobx';
import { SearchListModal, request, ImgFormatter } from 'jumai-utils';
import type { IMainSubStructureModel, PaginationData, NormalProgrammeParams } from 'jumai-utils';
import type { Product } from './interface';
import type ParentStore from '../store';
import SetServiceStore from './setServiceModal/store';

const ADDED_SERVICE_TAG_COLOR = {
  '1': {
    label: '换吊牌',
    color: 'blue',
  },
  '3': {
    label: '换包装',
    color: 'cyan',
  },
  '4': {
    label: '放合格证',
    color: 'green',
  },
  '5': {
    label: '放好评卡',
    color: 'orange',
  },
  '6': {
    label: '放发货单',
    color: 'gold',
  },
  '8': {
    label: '放水洗唛',
    color: 'volcano',
  },
  '9': {
    label: '换领标',
    color: 'geekblue',
  },
};

export default class ByProductStore {
  constructor(parent: ParentStore) {
    this.parent = parent;
    this.gridModel.onQuery();
  }

  public parent: ParentStore;

  public setServiceStore = new SetServiceStore(this);

  @computed public get gridModel() {
    return this.searchListModal.grid.gridModel;
  }

  private grid: IMainSubStructureModel<Product> = {
    buttons: [
      {
        text: '批量设置增值服务',
        handleClick: () => this.onClickBatchSetButton(),
      },
      {
        text: '批量删除',
        handleClick: () => this.onClickBatchDeleteButton(),
      },
    ],
    grid: {
      columns: [
        {
          name: '操作',
          key: 'operation',
          width: 160,
          formatter: ({ row }) => {
            return (
              <Space>
                <Button
                  onClick={() => this.setServiceStore.onOpen([row.gmsGoodsId])}
                  size="small"
                  type="link"
                >
                  设置增值服务
                </Button>
                {
                  row.addedService && (
                    <Button
                      onClick={() => this.onDeleteRecords([row.gmsGoodsId])}
                      size="small"
                      type="link"
                    >
                      删除
                    </Button>
                  )
                }
              </Space>
            );
          },
        },
        {
          name: '图片',
          key: 'mainPicUrl',
          width: 80,
          formatter: ({ row }) => {
            return (
              <ImgFormatter value={row.mainPicUrl}/>
            );
          },
        },
        {
          name: '店铺',
          key: 'shopName',
          width: 150,
        },
        {
          name: '商品名称',
          key: 'goodsName',
        },
        {
          name: '平台商品ID',
          key: 'platformId',
          width: 100,
        },
        {
          name: '增值服务',
          key: 'addedService',
          formatter: ({ row }) => {
            if (Array.isArray(row.addedService)) {
              const content = (
                row.addedService.map((i) => {
                  const service = ADDED_SERVICE_TAG_COLOR[i];
                  return (
                    <Tag
                      color={service.color}
                      key={i}
                    >
                      {service.label}
                    </Tag>
                  );
                })
              );
              return (
                <Popover content={content}>
                  {content}
                </Popover>
              );
            }
            return null;
          },
        },
        {
          name: '创建时间',
          key: 'lastUpdateTime',
          width: 150,
        },
      ].map((col) => ({
        ...col,
        resizable: true,
      })),
      primaryKeyField: 'gmsGoodsId',
      setColumnsDisplay: true,
      gridIdForColumnConfig: 'egenieTsOmsWholeSaleModalAdderServiceByProductTable',
    },
    api: {
      onQuery: (params) => {
        const { page, pageSize, filterParams } = params;
        if (filterParams.platformIdList) {
          filterParams.platformIdList = filterParams.platformIdList.split(',');
        }
        if (filterParams.serviceStatus) {
          filterParams.serviceStatus = 1;
        } else {
          filterParams.serviceStatus = 0;
        }
        return request<PaginationData<Product>>({
          url: '/api/baseinfo/rest/shop/platform/goods/value/added/query',
          method: 'POST',
          data: {
            page,
            pageSize,
            ...filterParams,
          },
        });
      },
    },
  };

  private filterset: Partial<NormalProgrammeParams> = {
    count: 5,
    filterItems: [
      {
        type: 'select',
        label: '店铺',
        field: 'shopId',
        data: [],
      },
      {
        type: 'input',
        isMultipleSearch: true,
        label: '平台商品ID',
        field: 'platformIdList',
      },
      {
        type: 'input',
        label: '平台商品名称',
        field: 'goodsName',
      },
      {
        type: 'checkbox',
        field: 'serviceStatus',
        label: '已设置服务',
        data: [
          {
            label: '已设置服务',
            value: '1',
          },
        ],
        value: ['1'],
      },
    ],
  };

  public searchListModal = new SearchListModal({
    programme: this.filterset,
    grid: this.grid,
  });

  // 批量设置增值服务
  private onClickBatchSetButton = () => {
    const ids = Array.from(this.gridModel.selectedIds);

    if (ids.length === 0) {
      message.warning('请至少选择一行');
      return;
    }
    this.setServiceStore.onOpen(ids as number[]);
  };

  private onDeleteRecords = (ids: number[]) => {
    Modal.confirm({
      title: '确定删除吗？',
      onOk: async() => {
        await request({
          url: '/api/cloud/baseinfo/rest/value/added/external/proxy/platform/goods/config/delete',
          method: 'POST',
          data: { businessIdList: ids },
        });
        message.success('操作成功');
        this.gridModel.resetAll();
        this.gridModel.onQuery();
      },
    });
  };

  // 批量删除
  private onClickBatchDeleteButton = () => {
    const ids = Array.from(this.gridModel.selectedIds);
    if (ids.length === 0) {
      message.warning('请至少选择一行');
      return;
    }
    if (this.gridModel.selectRows.some((i) => !i.addedService)) {
      message.warning('请选择已经设置增值服务的商品进行删除');
      return;
    }
    this.onDeleteRecords(ids as number[]);
  };
}
