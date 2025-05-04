import type { IParentStore } from '../store';
import { toJS } from 'mobx';
import { message, Modal } from 'antd';
import type { BatchReportData } from 'jumai-common';
import { destroyModal, renderModal, request } from 'jumai-common';
import React from 'react';
import { BatchReport } from 'jumai-utils';

export const buttons = (context: IParentStore) => {
  return [
    {
      text: '新增\\拉取订单',
      handleClick: context.handleOpenOrderModal.bind(this, false),
      permissionId: '1',
      // icon: 'icon-add',
      display: (rows) => rows.every((el) => {
        return true;
      }),
      group: [
        {
          idx: 0,
          text: '复制新建',
          handleClick: context.handleOpenOrderModal.bind(this, true),
          permissionId: '275',
          // icon: 'icon-add',
          display: (rows) => {
            if (rows.length !== 1) {
              return false;
            }
            return true;
          },
        },
        {
          idx: 1,
          permissionId: '304',
          text: '导入新建',
          // icon: 'icon-import',
          handleClick: context.handleOpenImportAddModal,
          display: (rows) => rows.every((el) => {
            return true;
          }),
        },
        {
          idx: 3,
          permissionId: '4035',
          text: '手动同步订单',
          handleClick: () => {
            context.manualDownloadOrderModel.changeVisible(true);
          },
        },
      ],
    },
    {
      text: '审核',
      handleClick: () => {
        context.handleButtonOperation('checkOrders');
      },
      permissionId: '21',
      // icon: 'icon-audit',
      group: [
        {
          text: '反审核',
          handleClick: () => {
            context.handleButtonOperation('beforeUncheckOrders');
          },
          permissionId: '29',
          // icon: 'icon-audit_back',
        },
      ],
    },
    {
      text: '生成采购单',
      handleClick: context.handleGeneratePmsOrder,
      permissionId: '222',
      // icon: 'icon-deliver_goods',
    },
    {
      permissionId: '312',
      text: '拿货拆分',
      // icon: 'icon-audit_back',
      handleClick: context.handlePurchaseSplit,
      group: [
        {
          permissionId: '311',
          text: '按分录拆分',
          // icon: 'icon-split',
          handleClick: context.handleDetailSplit,
        },
        {
          permissionId: '310',
          text: '缺货拆分',
          // icon: 'icon-split',
          handleClick: context.handleLackSplit,
        },
        {
          text: '按重量拆分',
          // icon: 'icon-split',
          handleClick: context.handleByWeightSplit,
        },
        {
          permissionId: '313',
          text: '自由拆分',
          // icon: 'icon-audit_back',
          handleClick: context.handleFreeSplit,
        },
        {
          permissionId: '310',
          text: '按SKU拆分',
          // icon: 'icon-split',
          handleClick: context.handleBySkuSplit,
        },
        {
          permissionId: '315',
          text: '按比例拆分',
          // icon: 'icon-audit_back',
          handleClick: context.handlePercentageSplit,
        },
        {
          permissionId: '850',
          text: '按供应商拆分',
          // icon: 'icon-split',
          handleClick: context.handleSupplierSplit,
        },
        {
          permissionId: '6016',
          text: '退款商品拆分',
          // icon: 'icon-split',
          handleClick: context.handleRefoundProductSplit,
        },
        {
          permissionId: '6062',
          text: '预售拆分',
          // icon: 'icon-split',
          handleClick: context.handleSplitPreSaleSku,
        },
        {
          text: '拆分无效商品',
          // icon: 'icon-split',
          handleClick: () => {
            const selectRows = context.mainGridModel.gridModel.selectRows;
            if (selectRows.length === 0) {
              const error = '请至少选择一条数据';
              message.warning({
                key: error,
                content: error,
              });
              return;
            }

            if (selectRows.some((item) => item.orderType !== 6)) {
              const error = '请选择订单类型是无效商品的订单';
              message.warning({
                key: error,
                content: error,
              });
              return;
            }

            Modal.confirm({
              title: '确认拆分无效商品吗?',
              onOk: () => request<BatchReportData>({
                url: '/api/saleorder/rest/split/splitNotMatchSkuOrder',
                method: 'POST',
                data: { ids: selectRows.map((item) => item.saleOrderId) },
              })
                .then((info) => {
                  destroyModal();
                  renderModal(
                    <BatchReport
                      {...info.data}
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
                  message.success('拆分成功');
                  context.mainGridModel.gridModel.onRefresh();
                }),
            });
          },
        },
      ],
    },
    {
      permissionId: '18',
      text: '合并',
      // icon: 'icon-merge',
      handleClick: context.handleCombineOrders,
      group: [
        {
          text: '强制合并',
          permissionId: '722',
          handleClick: context.forcedMergers,
          // icon: 'icon-merge',
        },
      ],
    },
    {
      text: '挂起',
      handleClick: context.handleSuspend,
      permissionId: '23',
      // icon: 'icon-suspend',
      group: [
        {
          text: '解挂',
          handleClick: () => {
            context.handleButtonOperation('unsuspendOrder');
          },
          permissionId: '23',
          // icon: 'icon-export',
        },
      ],
    },
    {
      text: '作废',
      handleClick: () => {
        context.handleButtonOperation('invalidateOrders');
      },
      permissionId: '25',
      // icon: 'icon-void',
    },
    {
      text: '批量操作',
      permissionId: '173',
      // icon: 'icon-void',
      type: 'dropdown',
      group: [
        {
          text: '修改仓库快递',
          handleClick: context.handleOpenModidfyWareCourier,
          permissionId: '307',
          // icon: 'icon-batch_revise',
        },
        {
          text: '修改客服备注',
          handleClick: () => {
            context.handleOpenModifyRemark('sellerMemo');
          },
          permissionId: '309',
          // icon: 'icon-batch_revise',
        },
        {
          text: '修改订单备注',
          handleClick: () => {
            context.handleOpenModifyRemark('systemMemo');
          },
          permissionId: '308',
          // icon: 'icon-batch_revise',
        },
        {
          text: '修改便签',
          handleClick: () => {
            context.handleOpenModifyRemark('note');
          },
          permissionId: '4077',
          // icon: 'icon-batch_revise',
        },
      ],
    },

    {
      text: '导出',
      handleClick: () => context.handleExport(1),
      permissionId: '6',
      // icon: 'icon-export',
      group: [
        {
          text: '商品汇总导出（仅限未打印）',
          handleClick: () => context.handleExport(2),
          permissionId: '3024',
          // icon: 'icon-export',
        },
        {
          text: '按供应商导出（仅限未打印）',
          handleClick: () => context.handleExport(4),
          // icon: 'icon-export',
        },
        {
          text: '导出（包含收件人信息）',
          permissionId: '5023',
          // icon: 'icon-export',
          handleClick: () => {
            context.handleExport(3);
          },
        },
      ],
    },
    {
      text: '预发货',
      handleClick: context.handlePreShipment,
      permissionId: '3017',
      icon: '',
    },
    {
      text: '批量换商品',
      handleClick: context.bulkExchangeStore?.onBulkExchangeClick,
      permissionId: '610',
      icon: '',
      group: [
        {
          text: '批量替换无效商品',
          permissionId: '6014',
          handleClick: () => {
            context.invalidGoodsModel.onOpen();
          },
        },
        {
          text: '商品替换（按策略）',
          handleClick: () => {
            context.replaceProductStore.show();
          },
        },
      ],
    },
    {
      text: '匹配无效商品',
      handleClick: () => {
        context.handleButtonOperation('matchSku');
      },
      permissionId: '172',
      // icon: 'icon-export',
      group: [
        {
          text: '重新匹配商品',
          permissionId: '172',
          // icon: 'icon-export',
          handleClick: () => {
            context.mateProduct();
          },
        },
      ],
    },
    {
      text: '优先发货',
      permissionId: '175',
      handleClick: context.priorityDelivery,
      group: [
        {
          text: '整单优先发货',
          permissionId: '175',
          // icon: 'icon-deliver_goods',
          handleClick: context.allPriorityDelivery,
        },
      ],
    },
    {
      text: '代发',
      permissionId: '4034',
      handleClick: context.handleWholesale,
      group: [
        {
          text: '取消代发',
          handleClick: context.onCancel,
        },
        {
          text: '设置增值服务',
          handleClick: () => {
            context.setValueAddedServiceStore.show();
          },
        },
      ],
    },
    {
      text: '更多操作',
      // icon: 'icon-void',
      type: 'dropdown',
      group: [
        {
          text: '批量添加商品',
          handleClick: () => {
            context.handleAddProduct(true);
          },
          permissionId: '306',
          // icon: 'icon-goods_add',
        },
        // {
        //   text: '取消黑名单',
        //   handleClick: () => {
        //     context.handleButtonOperation('cancelBlackList');
        //   },
        //   permissionId: '217',
        //   icon: 'icon-black',
        // },
        // {
        //   text: '设置黑名单',
        //   handleClick: () => {
        //     context.handleButtonOperation('confirmBlackList');
        //   },
        //   permissionId: '317',
        //   icon: 'icon-black',
        // },
        {
          text: '设置分组',
          handleClick: context.handleSetGroup,
          permissionId: '321',
          // icon: 'icon-audit',
        },
        {
          text: '重新拿货',
          handleClick: context.handleBatchOutOfStock,
          permissionId: '320',
          // icon: 'icon-deliver_goods',
        },
        {
          text: '重算订单',
          handleClick: context.handleOpenReRunModal,
          permissionId: '1106',
          // icon: 'icon-batch_revise',
        },
        {
          text: '汇总预览',
          handleClick: context.handleDetailPreview,
          permissionId: '323',
          // icon: 'icon-audit',
        },
        {
          text: '上传备注', // todo 是否原来的上传备注
          handleClick: context.handleUploadRemark,
          permissionId: '174',
          // icon: 'icon-add_after_sale',
        },
        {
          text: '设置标签',
          handleClick: context.handleMemoSet,
          permissionId: '1101',
          // icon: 'icon-batch_revise',
          display: (rows) => {
            return rows.length > 0;
          },
        },
        {
          text: '清空格子',
          permissionId: '135',
          handleClick: context.emptySquares,
        },
        {
          text: '导入上传备注',
          permissionId: '5007',
          handleClick: () => {
            context.importModel.openModal({ sheetName: 'seller_memo_and_flag' });
          },
        },
      ],
    },

  ];
};
