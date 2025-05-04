
import { InputNumber, Tooltip, message, Modal, Select, Popover, Row, Col } from 'antd';
import { EgGridModel, request, ImgFormatter } from 'jumai-utils';
import type { BaseData } from 'jumai-utils';
import _ from 'lodash';
import { observable, action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { api } from '../../../utils/api';
import type { IOperationRes } from '../../order/interface';
import { MarkIcon } from '../marklist';
import styles from './index.less';

interface IOption{
  label: string;
}
interface ProductPaginationData<T = unknown>{
  list: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPageCount: number;
}

export default class Store {
  constructor(options) {
    this.parent = options.parent;
    if (this.parent.orderType === 'historyOrder') {
      this.productInfoEgGridModel.columns[0].ejlHidden = true;
    }
  }

  @observable public parent;

  @observable public popoverVisible = false;

  @observable public openedIndex = null;

  @observable public orderId;// 主表id

  @observable public orderRow;// 主表row

  @observable public colorOptions;// 颜色选项

  @observable public sizeOptions;// 尺寸选项

  // 商品信息gridModel
  @observable public productInfoEgGridModel = new EgGridModel({
    columns: [
      {
        key: 'operation',
        name: '操作',
        width: 50,
        frozen: true,
        formatter: ({ row }) => {
          const { invalid, sale_order_id, sale_order_detail_id, sku_id, product_no, terminate } = row;
          const { isChecked, originType, warehouseId } = this.parent.mainGridModel.gridModel.cursorRow;
          return (
            <div
              className={styles.normalGrid}
            >
              {
                (invalid || !isChecked) && (
                  <a onClick={() => {
                    this.exchangeProduct(product_no, sale_order_detail_id, sku_id, warehouseId);
                  }}
                  >
                    换商品
                  </a>
                )
              }
              {
                (!invalid && !isChecked && sku_id) && (
                  <a onClick={() => {
                    this.copyProduct(sale_order_detail_id);
                  }}
                  >
                    复制
                  </a>
                )
              }
              {
                invalid && (
                  <a onClick={() => {
                    this.matchSku(sale_order_detail_id);
                  }}
                  >
                    匹配SKU
                  </a>
                )
              }
              <a onClick={() => {
                const flag = Boolean(terminate);
                this.teminateProduct(flag, sale_order_detail_id, sale_order_id);
              }}
              >
                {terminate ? '反终结' : '终结'}
              </a>
              {
                (!isChecked) && (
                  <a onClick={() => {
                    this.deleteProduct(sale_order_detail_id, sale_order_id);
                  }}
                  >
                    删除
                  </a>
                )
              }
              {
                this.parent?.isProxySend && (
                  <a onClick={() => this.onClickMatchDropshipProductButton({
                    ...row,
                    originType,
                  })}
                  >
                    匹配代发商品
                  </a>
                )
              }
            </div>
          );
        },
      },
      {
        key: 'mark',
        name: '标记',
        width: 80,
        formatter: ({ row }) => {
          const { refund_state, terminate, is_advanced_booking, origin_estimate_con_time, goods_sku_id } = row;

          // 直接取this.orderRow按钮操作后点击出错
          const { order_type_code } = this.parent.mainGridModel.gridModel.cursorRow;
          return (
            <div
              className={styles.status}
              style={{
                lineHeight: 'normal',
                height: '120px',
              }}
            >
              {refund_state
                ? (
                  <MarkIcon
                    className="icon-sign_return"
                    color="#FB2B0A"
                  />
                ) : ''}
              {
                terminate
                  ? (
                    <MarkIcon
                      className="icon-sign_stop"
                      color="#FB2BDD"
                    />
                  ) : ''
              }
              {
                is_advanced_booking ? (
                  <Tooltip title={origin_estimate_con_time}>
                    <i
                      className="mark-column-icon icon-sign_pre_sale"
                      style={{
                        color: '#F67EB0',
                        fontSize: '22px',
                      }}
                    />
                  </Tooltip>
                ) : ''
              }
              {
                (order_type_code === 8 && !goods_sku_id) ? (
                  <MarkIcon
                    className="icon-sign_wei"
                    color="#fec214"
                  />
                ) : ''
              }
            </div>
          );
        },
      },
      {
        key: 'detailInfo',
        name: '平台商品信息',
        minWidth: 460,
        formatter: ({ row }) => {
          return (
            <div
              className={styles.detailInfo}
              style={{ lineHeight: 'normal' }}
            >
              {
                row.pic_url ? (
                  <ImgFormatter
                    height={40}
                    value={row.pic_url}
                    width={40}
                  />
                ) : (
                  <img
                    height={40}
                    src=''
                    width={40}
                  />
                )
              }

              <div className={styles.detailDescription}>
                <div
                  className={styles.status}
                  style={{ marginBottom: '2px' }}
                >
                  {
                    row.is_donate ? (
                      <div className={styles.freeSend}>
                        赠
                      </div>
                    ) : ''
                  }
                  <Tooltip
                    className={styles.title}
                    title={row.title}

                  >
                    {row.platform_product_link ? (
                      <a onClick={(e) => {
                        e.stopPropagation();
                        window.open(row.platform_product_link);
                      }}
                      >
                        {row.title}
                      </a>
                    ) : (
                      <span onClick={(e) => {
                        e.stopPropagation();
                      }}
                      >
                        {row.title}
                      </span>
                    )}
                  </Tooltip>
                </div>
                <div className={styles.status}>
                  {row.status && (
                    <div className={styles.payStatu}>
                      {row.status}
                    </div>
                  )}
                  {
                    row.refund_status && (
                      <div
                        className={styles.refundStatus}
                        style={{ marginLeft: '2px' }}
                      >
                        {row.refund_status}
                      </div>
                    )
                  }
                </div>
                <div className={styles.basicInformation}>
                  <Tooltip
                    placement="topLeft"
                    title={`商家编码：${row.seller_outer_no}`}
                  >
                    <div className={styles.otherLine}>
                      {row.seller_outer_no}
                    </div>
                  </Tooltip>
                  <Tooltip
                    placement="topLeft"
                    title={`网店规格：${row.sku_properties_name}`}
                  >
                    <div className={styles.otherLine}>
                      {row.sku_properties_name}
                    </div>
                  </Tooltip>
                  <Tooltip
                    placement="topLeft"
                    title={`平台商品ID：${row.num_iid}`}
                  >
                    <div className={styles.otherLine}>
                      {row.num_iid}
                    </div>
                  </Tooltip>

                  <Tooltip
                    placement="topLeft"
                    title={`平台SKUid：${row.platform_sku_id}`}
                  >
                    <div className={styles.otherLine}>
                      {row.platform_sku_id}
                    </div>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip
                    placement="topLeft"
                    title={`平台单号：${row.origin_platform_order_code}`}
                  >
                    <div className={styles.otherLine}>
                      平台单号：
                      {row.origin_platform_order_code}
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'product_no',
        name: '系统商品信息',
        width: 280,
        formatter: observer(({ row }) => {
          return (
            <div className={styles.normalGrid}>

              <Tooltip title={row.vendorName}>
                <div>
                  供应商:
                  {row.vendorName}
                </div>
              </Tooltip>
              <Tooltip title={row.vendorProductNo}>
                <div>
                  供应商货号:
                  {row.vendorProductNo}
                </div>
              </Tooltip>
              <Tooltip title={row.product_no}>
                <div>
                  商品编码:
                  {row.product_no}
                </div>
              </Tooltip>
            </div>
          );
        }),
      },
      {
        key: 'sku_no',
        name: 'SKU编码',
        minWidth: 250,

        // formatter: ({ row }) => {
        //   let sku_tags = [];
        //   if (row.sku_tags) {
        //     sku_tags = row.sku_tags?.split(',')
        //       .map((item) => {
        //         return (
        //           <span className={styles.tags}>
        //             {item}
        //           </span>
        //         );
        //       });
        //   }
        //   return (
        //     <div className={styles.skuNo}>
        //       <div className={styles.skuTags}>
        //         {sku_tags}
        //       </div>
        //       <span>
        //         {row.sku_no}
        //       </span>
        //     </div>
        //   );
        // },
        formatter: observer(({ row }) => {
          let sku_tags = [];
          if (row.sku_tags) {
            sku_tags = row.sku_tags?.split(',')
              .map((item) => {
                return (
                  <span className={styles.tags}>
                    {item}
                  </span>
                );
              });
          }
          return (
            <div className={styles.normalGrid}>
              {sku_tags?.length ? (
                <Popover content={sku_tags}>
                  <div className={styles.skuTags}>
                    {sku_tags}
                  </div>
                </Popover>
              ) : undefined}
              <Tooltip title={row.sku_no}>
                <span className={styles.normalGridSkuNo}>
                  {row.sku_no}
                </span>
              </Tooltip>

              <div className={styles.colorOrSize}>
                颜色:
                {
                  row.edit && !row.terminate ? (
                    <Select
                      className={styles.select}
                      defaultValue={row.color_type}

                      onChange={(value, option) => {
                        // @ts-ignore
                        if (option.label === row.color_type || !row.color_type) {
                          return;
                        }
                        this.changeByColorAndSize(row.sku_id, value, row.size_type_code, row.sale_order_detail_id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => {
                        this.queryColorAndSize(row.sku_id, row.color_type_code, row.size_type_code, 'color');
                      }}
                      options={this.colorOptions}
                    />
                  )
                    : (
                      <span>
                        {row.color_type}
                      </span>
                    )
                }
              </div>
              <div className={styles.colorOrSize}>
                尺码:
                {
                  row.edit && !row.terminate ? (
                    <Select
                      className={styles.select}
                      defaultValue={row.size_type}
                      onChange={(val, options) => {
                        // @ts-ignore
                        if (options.label === row.size_type || !row.size_type) {
                          return;
                        }
                        this.changeByColorAndSize(row.sku_id, row.color_type_code, val, row.sale_order_detail_id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={() => {
                        this.queryColorAndSize(row.sku_id, row.color_type_code, row.size_type_code, 'size');
                      }}
                      options={this.colorOptions}
                    />
                  ) : (
                    <span>
                      {row.size_type}
                    </span>
                  )
                }
              </div>
            </div>
          );
        }),
      },
      {
        key: 'payment',
        name: '实付金额',
        minWidth: 180,
        formatter: ({ row }) => {
          return (
            <div className={styles.paymentOrInputNumber}>
              { row.payment ? (
                <span>
                  ¥
                  {row.payment}
                </span>
              ) : <span/>}
              {row.sale_price ? (
                <span>
                  单价：¥
                  {row.sale_price}
                </span>
              ) : <span/>}
              {row.edit && !row.terminate ? (
                <div className={styles.terminate}>
                  数量：
                  <InputNumber
                    className={styles.terminateInputNumber}
                    min={1}
                    onBlur={() => {
                      this.changeCount(true, row.num, row.sale_order_detail_id);
                    }}
                    onChange={(value) => {
                      this.changeCount(false, value, row.sale_order_detail_id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    precision={0}
                    value={row.num}
                  />
                </div>
              ) : (
                <span>
                  数量：
                  {row.num}
                </span>
              )}
            </div>

          );
        },
      },
      {
        key: 'is_out_of_stock',
        name: '库存信息',
        minWidth: 200,
        formatter: ({ row }) => {
          return (
            <div className={styles.stockWrapper}>
              <div>
                净重：
                {row.netWeight}
              </div>
              <div>
                可销库存：
                {row.stock}
              </div>
              <div>
                锁定数量：
                {row.lockStock}
              </div>
              <div style={{ display: 'flex' }}>
                <div
                  className={styles.status}
                  style={{ marginRight: '4px' }}
                >
                  <div
                    className={styles.statePoint}
                    style={{ backgroundColor: row.is_out_of_stock ? '#F2270A' : '#D8D8D8' }}
                  />
                  {row.is_out_of_stock ? '缺货' : '不缺货'}
                </div>
                <div className={styles.status}>
                  <div
                    className={styles.statePoint}
                    style={{ backgroundColor: row.sku_purchase_state === '未拿货' ? '#D8D8D8' : '#02C190' }}
                  />
                  {row.sku_purchase_state}
                </div>
              </div>
              <Tooltip
                placement="bottom"
                title={row.unique_code}
              >
                <span className={styles.uniqueCode}>
                  {row.unique_code}
                </span>
              </Tooltip>
              <Tooltip
                placement="bottom"
                title={row.purchase_order_no}
              >
                <span className={styles.uniqueCode}>
                  {row.purchase_order_no}
                </span>
              </Tooltip>
            </div>
          );
        },
      },
    ].map((item) => ({
      resizable: true,
      ...item,
    })),
    rows: [],
    primaryKeyField: 'sale_order_detail_id',
    rowHeight: 120,
    showCheckBox: false,
    showNormalEmpty: true,
    showPager: false,
    forceRowClick: true,
    api: {
      onRowClick: (rowId, row) => {
        // 订单查询页不允许编辑
        if (this.parent.orderType === 'historyOrder') {
          return false;
        }
        if (this.orderRow.isChecked) {
          // 已审核不允许编辑
          return false;
        }
        const { rows } = this.productInfoEgGridModel;
        this.productInfoEgGridModel.rows = rows?.map((item) => {
          return {
            ...item,
            edit: item.sale_order_detail_id === rowId,
          };
        });

        return {
          ...row,
          edit: true,
        };
      },
    },
  });

  // 初始化商品详情
  @action public initProductInfo = (id: string, row): void => {
    this.orderId = id;
    this.orderRow = row;

    request<BaseData<ProductPaginationData>>({
      url: `${api.queryOrderInfo}?orderID=${id}&page=1&pageSize=1000`,
      method: 'GET',
    }).then((res) => {
      const operateIndex = this.parent.mainGridModel.gridModel.rows.findIndex((item) => item.saleOrderId == id);
      this.productInfoEgGridModel.rows = res.data?.list;
      this.parent.mainGridModel.gridModel.rows[operateIndex].productInfo = this.productInfoEgGridModel;
    });
  };

  // 添加商品
  @action public addProduct = (): void => {
    this.parent.mainGridModel.gridModel.selectedIds = new Set([this.orderId]);
    this.parent.addProductStore.openAddProductModal();
  };

  // 改变数量（改用_.debounce防抖）
  private changeCount = (isBlur, newCount, detailId): void => {
    if (!isBlur) {
      this.productInfoEgGridModel.rows = toJS(this.productInfoEgGridModel.rows.map((item) => {
        if (detailId === item.sale_order_detail_id) {
          item.num = newCount;
        }
        return item;
      }));
    } else {
      const data = {
        detailId,
        newCount,
        orderId: this.orderId,
      };
      request<BaseData>({
        url: api.changeProdcutCount,
        method: 'POST',
        data,
      }).then((res) => {
        message.success('操作成功');
        this.initProductInfo(this.orderId, this.orderRow);
        if (this.parent?.orderDetailsModel?.visible) {
          return this.parent.orderDetailsModel.onRefreshGoods();
        }
      });
    }
  };

  // 关闭商品气泡框
  @action public closePopover = (): void => {
    if (this.parent.mainGridModel.gridModel.rows[this.openedIndex]) {
      this.parent.mainGridModel.gridModel.rows[this.openedIndex].visible = false;
    }
    this.openedIndex = null;
    this.orderId = '';
  };

  // 打开商品气泡框
  @action public openPopover = (row): void => {
    const currentOpenIndex = this.parent.mainGridModel.gridModel.rows.findIndex((item) => item.saleOrderId === row.saleOrderId);
    if (this.openedIndex !== null) {
      // 重复点击无效
      if (this.openedIndex === currentOpenIndex) {
        return;
      }
      this.closePopover();
    }

    this.openedIndex = currentOpenIndex;
    if (this.parent.mainGridModel.gridModel.rows[currentOpenIndex]) {
      this.parent.mainGridModel.gridModel.rows[currentOpenIndex].visible = true;
    }
    this.initProductInfo(String(row.saleOrderId), row);
  };

  // 删除商品
  @action public deleteProduct = (detailId, orderId): void => {
    Modal.confirm({
      title: '删除商品可能会导致平台发货失败，是否确认删除？',
      zIndex: 2000,
      onOk: () => {
        const data = {
          detailId,
          orderId,
        };
        request<BaseData>({
          url: api.deleteProduct,
          method: 'POST',
          data,
        }).then((res) => {
          const { status, data } = res;
          status === 'Failed' ? message.warn(data) : message.success(data);
          if (this?.parent?.orderDetailsModel?.visible) {
            return this.parent.orderDetailsModel.onRefreshGoods();
          }
          this.initProductInfo(orderId, this.orderRow);
        });
      },
    });
  };

  // 复制商品
  @action public copyProduct = (ids): void => {
    const data = { ids };
    request<BaseData<IOperationRes>>({
      url: api.copyProduct,
      method: 'POST',
      data,
    }).then((res) => {
      const { status, data } = res;
      if (status !== 'Successful') {
        message.warn(data);
        return;
      }
      const { failed } = data;
      if (failed) {
        message.warn(data.list[0].reason);
        return;
      }
      message.success('复制成功');
      if (this?.parent?.orderDetailsModel?.visible) {
        return this.parent.orderDetailsModel.onRefreshGoods();
      }

      // 复制后刷新列表
      this.initProductInfo(this.orderId, this.orderRow);
    });
  };

  // 终结 反终结
  @action public teminateProduct = (terminFlag, detailId, orderId): void => {
    const data = {
      detailId,
      orderId,
    };
    request<BaseData>({
      url: terminFlag ? api.unterminateProduct : api.terminateProduct,
      method: 'POST',
      data,
    }).then((res) => {
      message.success(res.data);
      this.initProductInfo(orderId, this.orderRow);
    });
  };

  // 匹配sku
  @action public matchSku = (detailId): void => {
    request<BaseData>({
      url: `${api.matchProduct}/${detailId}`,
      method: 'POST',
    }).then((res) => {
      message.success(res.data);
      this.initProductInfo(this.orderId, this.orderRow);
    });
  };

  // 换商品
  @action public exchangeProduct = (productNo, detailId, skuId, warehouseId): void => {
    const orderId = this.orderId;
    this.parent.exchangeProductStore.openExchangeProductModal(productNo, skuId, detailId, warehouseId, orderId);
  };

  // 查询颜色或尺码列表
  @action public queryColorAndSize = (skuId, colorType, sizeType, type): void => {
    if (!colorType || !sizeType) {
      this.colorOptions = [];
      return;
    }
    const data = {
      colorType: String(colorType),
      sizeType: String(sizeType),
      type: `${type}_type`,
      skuId,
    };
    request<BaseData<Array<{ name: string;code: number; }>>>({
      url: `${api.querySizeOrColor}`,
      method: 'POST',
      data,
    }).then((res) => {
      this.colorOptions = res.data?.map((item) => ({
        label: item.name,
        value: item.code,
      }));
    });
  };

  // 通过改变颜色或尺码改变sku
  @action public changeByColorAndSize = (skuId, colorType, sizeType, detailId): void => {
    const data = {
      colorType: String(colorType || ''),
      sizeType: String(sizeType || ''),
      detailId,
      oldSkuId: skuId,
      orderId: Number(this.orderId),
    };
    request<BaseData>({
      url: api.changeColorSize,
      method: 'POST',
      data,
    }).then((res) => {
      message.success('操作成功');
      if (this?.parent?.orderDetailsModel?.visible) {
        return this.parent.orderDetailsModel.onRefreshGoods();
      }
      this.initProductInfo(this.orderId, this.orderRow);
    });
  };

  // 点击匹配代发商品按钮
  private onClickMatchDropshipProductButton = (row: any) => {
    this.parent?.matchDropshipProductStore?.show(row);
  };
}

