import { CopyOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Tooltip, Popover, Divider, Select, Space } from 'antd';
import { observer } from 'mobx-react';
import { nanoid } from 'nanoid';
import React from 'react';
import type { FlagItem } from '../../utils';
import { MarkSymbol } from './marklist';
import styles from './index.less';
import { productContent } from './productDetail/productDetailModal';
import { ImgFormatter } from 'jumai-utils';
import { getAppRedirectUrl, getStaticResourceUrl } from 'jumai-common';

// 卖家备注旗帜
export const SellerFlagElement = observer(({
  parent,
  sellerFlags,
}: { parent: { flagData: Record<string, FlagItem>; }; sellerFlags: string; }) => {
  return (
    <div>
      {
        (sellerFlags || '').split(',').filter((item) => item && item !== '0')
          .map((item) => (
            <i
              className="icon-flag"
              key={item}
              style={{
                color: parent.flagData?.[item]?.color,
                fontSize: '16px',
                marginRight: '2px',
                verticalAlign: 'middle',
              }}
            />
          ))
      }
    </div>
  );
});

// 便签卡片内容
const memoContent = (memoList): JSX.Element => {
  return (
    <div style={{
      height: '300px',
      overflow: 'auto',
    }}
    >
      {
        !memoList ? (
          <span>
            加载中...
          </span>
        ) : (
          <>
            {
              memoList.map((item) => (
                <div key={nanoid()}>
                  <p>
                    {item.create_time_str}
                    {' '}
                    {item.show_name}
                  </p>
                  <p>
                    {item.content}
                  </p>
                  <Divider style={{ margin: '8px 0px' }} />
                </div>
              ))
            }
          </>
        )
      }
    </div>
  );
};

// 处理字典
function dealDict(context, fieldname: string) {
  const originDict = context.programme.filterItems.dict[fieldname];
  const dict = {};
  originDict?.forEach((item) => {
    Object.assign(dict, { [item.value]: item.label });
  });
  return dict;
}

// orderType true为订单处理 false为订单查询
export const columns = (context: any, orderType: boolean) => {
  return [
    {
      key: 'operate',
      name: '操作',
      width: 100,
      frozen: true,
      align: 'center',
      formatter: ({ row }) => {
        return (
          <Button
            className={styles.orderDetail}
            onClick={(e) => {
              if (orderType) {
                context.orderDetailsModel.onOpenClick(row.saleOrderId, row);
              } else {
                context.orderDetailStore.openOrderDetailModal(row.saleOrderId, row);
              }
            }}
            type="link"
          >
            订单详情
          </Button>
        );
      },
    },
    {
      key: 'memo',
      name: '便签',
      width: 50,
      align: 'center',
      formatter: ({ row }) => {
        return row.haveNotes ? (
          <Popover
            content={memoContent(row.memoInfo)}
            placement="rightTop"
            title="预览（点击进行编辑）"
            trigger="hover"
          >
            <div
              className={styles.iconNormal}
              onClick={() => {
                context.memoStore.showMemoModal(String(row.saleOrderId));
              }}
              onMouseEnter={() => {
                context.memoStore.initMemoInfo(String(row.saleOrderId), row);
              }}
            >
              <i className={`icon-note_the-content ${styles.memoHasContent}`} />
            </div>
          </Popover>
        )
          : (
            <div
              className={styles.iconNormal}
              onClick={() => {
                context.memoStore.showMemoModal(String(row.saleOrderId), row);
              }}
            >
              <i className="icon-note_the-content" />
            </div>
          );
      },
    },
    {
      key: 'mark',
      name: '标记&标签',
      width: 180,
      formatter: ({ row }) => {
        let refundStatusDom: React.ReactNode;
        if ([
          1,
          2,
        ].includes(row.refundStatus)) {
          refundStatusDom = (
            <div className={styles.refundStatus}>
              {row.refundStatus === 1 ? '待退款' : '已退款'}
            </div>
          );
        }
        return (
          <div style={{ display: 'flex' }}>
            <div className={styles.maskWrapper}>
              {refundStatusDom}
              {
                !(row.courierVo?.courierId) && (
                  <MarkSymbol
                    color="#2DC3BA"
                    text="递"
                    title="未匹配上快递公司"
                  />
                )
              }
              {
                (row.is_test_order_code === 1) && (
                  <MarkSymbol
                    color="#DB55DB"
                    text="测"
                    title="测试订单"
                  />
                )
              }
              {
                (row.proxySendStatus && row.proxySendStatus !== 3) ? (
                  <MarkSymbol
                    color="#27A358"
                    text="代"
                    title={row.proxySendStatus === 1 ? '未代发' : '已代发'}
                  />
                ) : undefined
              }
              {
                row.totalSku < row.totalNum && (
                  <MarkSymbol
                    color="#ff3300"
                    text="检"
                    title="检"
                  />
                )
              }
              {
                row.isSplit === 2 ? (
                  <div
                    className={styles.pointer}
                    onClick={() => {
                      context?.combineSplitReturn(true, row.saleOrderId);
                    }}
                  >
                    <MarkSymbol
                      color="#F7A651"
                      text="拆"
                      title="拆分"
                    />
                  </div>
                ) : undefined
              }
              {
                row.isCombined === 2 ? (
                  <div
                    className={styles.pointer}
                    onClick={() => {
                      context?.combineSplitReturn(false, row.saleOrderId);
                    }}
                  >
                    <MarkSymbol
                      color="#97CD3F"
                      text="合"
                      title="合并"
                    />
                  </div>
                ) : undefined
              }
              {
                row.orderType === 7 ? (
                  <MarkSymbol
                    color="#C5CAE4"
                    text="缺"
                    title="订单有缺货商品"
                  />
                ) : undefined
              }
              {
                row.preSale ? (
                  <MarkSymbol
                    color="#F67EB0"
                    text="预"
                    title="预售订单"
                  />
                ) : undefined
              }
              {row.orderType === 4 && (
                <MarkSymbol
                  color="#36B1EE"
                  text="异"
                  title="异"
                />
              )}
              {
                row.playState === 2 && (
                  <MarkSymbol
                    color="#82DC7E"
                    text="财"
                    title="订单需要财审"
                  />
                )
              }
              {row.originType === 2 && (
                <MarkSymbol
                  color="#806BDA"
                  text="售"
                  title="售后订单"
                />
              )}
              {
                row.isSuspended === 1 ? (
                  <MarkSymbol
                    color="#A60000"
                    text="挂"
                    title="订单已挂起"
                  />
                ) : undefined
              }
              {row.isTestOrder && (
                <MarkSymbol
                  color="#DB55DB"
                  text="测"
                  title="测试订单"
                />
              )}
              {
                row.isInvalidated === 1 && (
                  <MarkSymbol
                    color="#FF7F00"
                    text="废"
                    title="订单已作废"
                  />
                )
              }
              {
                row.blacklistType === 1 && (
                  <Tooltip
                    placement="bottom"
                    title={row.blacklistReason}
                  >
                    <MarkSymbol
                      color="#575757"
                      text="黑"
                    />
                  </Tooltip>
                )
              }
              {
                row.logisticsTimeOut && (
                  <MarkSymbol
                    color="#D81E06"
                    text="超"
                    title="超时"
                  />
                )
              }
              {row.priorityLockStock && (
                <MarkSymbol
                  color="#22DE38"
                  text="先"
                  title="优先发货"
                />
              )}
              {row.title && (
                <MarkSymbol
                  color="red"
                  text="票"
                  title="发票"
                />
              )}
              {
                row.cnService && (
                  <MarkSymbol
                    color="#3399FF"
                    text="时"
                    title="时效"
                  />
                )
              }
              {
                row.storeCode && (
                  <MarkSymbol
                    color="#74D96E"
                    text="京"
                  />
                )
              }
              {
                row.originType === 3 && (
                  <MarkSymbol
                    color="#2A6DD5"
                    text="外"
                    title="线下手工新建或导入的订单"
                  />
                )
              }
              {
                row.testOrder && (
                  <MarkSymbol
                    color="rgb(219, 85, 219)"
                    text="测"
                    title="测试订单"
                  />
                )
              }
              {
                row.jiCode ? (
                  <MarkSymbol
                    color="red"
                    text="急"
                  />
                ) : undefined
              }
              {
                row.unableDeliver ? (
                  <MarkSymbol
                    color="red"
                    text="停"
                  />
                ) : undefined
              }
            </div>
            <div style={{ overflow: 'auto' }}>
              {
                row.tradeMemo && row.tradeMemo.split(',')
                  .map((item) => {
                    let content = (
                      <div>
                        收件人地址为集运仓（中转）地址，若您需要查看消费者信息，请您前往相应的商家后台进行查看。
                      </div>
                    );
                    if (item === '集运订单' || item === '暂停发货' || item === '顺丰包邮') {
                      if (item === '暂停发货') {
                        content = (
                          <div>
                            该订单因发货地疫情影响，暂不支持发货，当疫情限制解除时，订单将重启承诺发货时间倒计时并支持发货
                          </div>
                        );
                      }
                      if (item === '顺丰包邮') {
                        content = (
                          <div className={styles.sfTag}>
                            商家已选择本商品承诺顺丰包邮。为保障消费者体验，
                            本商品请选择顺丰速运or顺丰快运发货，否则会扣除10元货款赔付给消费者。
                          </div>
                        );
                      }
                      return (
                        <Popover
                          content={content}
                          key={nanoid()}
                        >
                          <span
                            className={styles.tradeMemo}
                          >
                            {item}
                          </span>
                        </Popover>
                      );
                    }
                    return (
                      <span
                        className={styles.tradeMemo}
                        key={nanoid()}
                      >
                        {item}
                      </span>
                    );
                  })
              }
            </div>
          </div>
        );
      },
    },
    {
      key: 'productPic',
      name: '商品图片',
      width: 150,
      sidx: 'skuId',
      sortable: true,

      formatter: ({ row }) => {
        const noPic = 'data:image/png;base64,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';

        const saleOrderTableSkuVoListDom = row?.saleOrderTableSkuVoList?.map((item) => {
          let dom = (
            <img
              className={styles.pic}
              src={item.pic}
            />
          );
          if (!item.pic) {
            dom = (
              <div
                className={styles.noPic}
              >
                <img src={getStaticResourceUrl('customer-source/noPic.png')} />
              </div>
            );
          }

          return (
            <Popover
              content={(
                <div className={styles.saleOrderTableSkuVoListPopover}>
                  {item.pic ? (
                    <img
                      src={item.pic}
                    />
                  ) : (
                    <div
                      className={`${styles.noPic} ${styles.popoverNoPic}`}

                    >
                      <img src={noPic} />
                    </div>
                  )}
                  <span title={item.productNo}>
                    {item.productNo}
                  </span>
                  <span
                    style={(!item.colorType && !item.sizeType) ? { display: 'none' } : undefined}
                    title={item.skuNo}
                  >
                    {`${item.colorType || ''}  ${item.sizeType || ''}`}
                  </span>
                  <div
                    className={styles.mainCommodity}
                    style={item.parentProductName ? undefined : { display: 'none' }}
                  >
                    <ImgFormatter
                      height={40}
                      value={item.parentPic || noPic}
                      width={40}
                    />
                    <div title={item.parentProductName}>
                      <span>
                        组
                      </span>
                      {item.parentProductName}
                    </div>
                  </div>
                </div>
              )}
              overlayClassName={styles.saleOrderPopover}
            >
              {dom}
            </Popover>
          );
        });
        return (
          <Popover
            arrowPointAtCenter
            content={productContent(row.isChecked, row.isSuspended, row.productInfo, context.productDetailStore.addProduct, orderType)}
            onVisibleChange={(visible) => {
              if (!visible) {
                // 如果此时页面有其他弹窗，不关闭popover
                if (document.getElementsByClassName('ant-modal-mask').length > 0) {
                  return;
                }

                context.productDetailStore.closePopover();
              }
            }}
            open={row.visible}
            overlayClassName={styles.popoverWrapper}
            overlayStyle={{ width: '85%' }}
            placement="bottom"

            title={(
              <div className={styles.popoverTitle}>
                <span>
                  商品详情
                </span>
                <div
                  onClick={context.productDetailStore.closePopover}
                  style={{ cursor: 'pointer' }}
                >
                  <CloseOutlined />
                </div>
              </div>
            )}
            trigger="click"
          >
            <div
              className={styles.saleOrderTableSkuVoListBody}
              onClick={() => {
                context.productDetailStore.openPopover(row);
              }}
            >
              <div className={styles.saleOrderTableSkuVoList}>
                {saleOrderTableSkuVoListDom}
              </div>
              {
                saleOrderTableSkuVoListDom?.length ? (
                  <span>
                    {saleOrderTableSkuVoListDom?.length}
                  </span>
                ) : undefined
              }

            </div>
          </Popover>
        );
      },
    },
    {
      key: 'productDetails',
      name: '商品详情',
      width: 150,
      sidx: 'skuId',
      sortable: true,
      formatter: ({ row }) => {
        const saleOrderTableSkuVoListSkuNo = row?.saleOrderTableSkuVoList?.map((item) => {
          return `${item.skuNo ?? ''} * ${item.itemNum}`;
        });
        return (
          <Popover
            content={(
              <div className={styles.productDetailsSkuNo}>
                {saleOrderTableSkuVoListSkuNo?.map((item) => {
                  return (
                    <span title={item}>
                      {item}
                    </span>
                  );
                })}

              </div>
            )}
            overlayClassName={styles.saleOrderPopover}
          >
            <div
              className={styles.saleOrderTableSkuVoListSkuNo}
            >
              {saleOrderTableSkuVoListSkuNo?.filter((skuNo) => skuNo && skuNo?.trim())?.join(',')}
            </div>
          </Popover>

        );
      },
    },
    {
      key: 'platformProductOuterNo',
      name: '平台商品',
      width: 150,
      formatter: ({ row }) => {
        const saleOrderTableSkuVoListSkuNo = row?.saleOrderTableSkuVoList?.map((item) => {
          return `${item.numIid ? `${item.numIid} * ` : ''}${item.platformProductOuterNo || ''}`;
        });
        return (
          <Popover
            content={(
              <div className={styles.productDetailsSkuNo}>
                {saleOrderTableSkuVoListSkuNo?.map((item) => {
                  return (
                    <span title={item}>
                      {item}
                    </span>
                  );
                })}

              </div>
            )}
            overlayClassName={styles.saleOrderPopover}
          >
            <div
              className={styles.saleOrderTableSkuVoListSkuNo}
            >
              {saleOrderTableSkuVoListSkuNo?.filter((platformProductOuterNo) => platformProductOuterNo && platformProductOuterNo?.trim())?.join(', ')}
            </div>
          </Popover>

        );
      },
    },

    {
      key: 'saleOrderNo',
      name: (<div className={styles.saleOrderNoHeader}>
        订单编号
        <Tooltip
          placement="bottom"
          title="点击复制"
        >
          <span
            className={`icon-copy ${styles.copyMutilColumnsText}`}
            onClick={(e) => context.copyMutilColumnsText(e, 'saleOrderNo')}>
          </span>
        </Tooltip>
      </div>),
      width: 200,
      formatter: ({ row }) => {
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
          >
            <span>
              {row.saleOrderNo}
            </span>
            <Tooltip
              placement="bottom"
              title="点击复制"
            >
              <span onClick={context.copyText}>
                <CopyOutlined
                  style={{
                    color: '#1978ff',
                    marginLeft: '4px',
                    cursor: 'pointer',
                  }}
                />
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      key: 'orderTypeDesc',
      name: '订单类型',
      width: 80,
    },
    {
      key: 'proxySendStatus',
      name: '代发状态',
      width: 80,
      formatter: ({ row }) => {
        let proxySendStatus = '';
        switch (String(row.proxySendStatus)) {
          case '1': {
            proxySendStatus = '未代发';
            break;
          }
          case '2': {
            proxySendStatus = '已代发 ';
            break;
          }
          case '3': {
            proxySendStatus = '取消代发 ';
            break;
          }
          default: {
            proxySendStatus = '无需代发';
          }
        }

        return (
          <span>
            {proxySendStatus}
          </span>
        );
      },
    },
    {
      key: 'cnServiceDesc',
      name: '订单时效',
      width: 80,
    },
    {
      key: 'platformOrderCode',
      name: (<div className={styles.saleOrderNoHeader}>
        平台单号
        <Tooltip
          placement="bottom"
          title="点击复制"
        >
          <span
            className={`icon-copy ${styles.copyMutilColumnsText}`}
            onClick={(e) => context.copyMutilColumnsText(e, 'platformOrderCode')}>
          </span>
        </Tooltip>
      </div>),
      width: 200,
    },
    {
      key: 'isChecked',
      name: '是否审核',
      width: 80,
      align: 'center',
      formatter: ({ row }) => (row.isChecked ? (
        <span style={{ color: '#116e03' }}>
          已审核
        </span>
      ) : (
        <span style={{ color: '#f75200' }}>
          未审核
        </span>
      )),
      sortable: true,
    },
    {
      key: 'buyerMessage',
      name: '买家留言',
      width: 200,
      sortable: true,
      formatter: ({ row }) => {
        const showValue = row.buyerVo?.buyerMessage?.replace(/\n\n/g, '\n')
          .split('\n')
          .join('\n');
        const {
          buyerMessageRead,
          saleOrderId,
        } = row;
        return (
          orderType ? (
            <div className={styles.readWrapper}>
              <Tooltip
                placement="bottom"
                title={row.buyerVo?.buyerMessage || ''}
              >
                <span className={styles.showValue}>
                  {showValue}
                </span>
              </Tooltip>
              {
                row.buyerVo?.buyerMessage && (
                  !buyerMessageRead ? (
                    <i
                      className={`icon-sign_read ${styles.iconRead}`}
                      onClick={() => {
                        context.updateReadMark(saleOrderId, 'buyer_message_read');
                      }}
                    />
                  ) : (
                    <i
                      className={`icon-sure ${styles.sure}`}
                    />
                  )
                )
              }
            </div>
          ) : (
            <Tooltip
              placement="bottom"
              title={row.buyerVo?.buyerMessage}
            >
              <span>
                {showValue}
              </span>
            </Tooltip>
          )
        );
      },
    },
    {
      key: 'sellerMemo',
      name: '客服备注&旗帜',
      width: 200,
      sortable: true,
      formatter: ({ row }) => {
        const showValue = row.sellerMemo?.replace(/\n\n/g, '\n')
          .split('\n')
          .join('\n');
        const {
          sellerMemoRead,
          saleOrderId,
          sellerFlags,
        } = row;
        return (
          orderType ? (
            <div className={styles.readWrapper}>
              <Tooltip
                placement="topLeft"
                title={row.sellerMemo}
              >
                <span
                  className={styles.showValue}
                  style={{ display: 'flex' }}
                >
                  <SellerFlagElement
                    parent={context}
                    sellerFlags={sellerFlags}
                  />
                  <span className={styles.sellerMemo}>
                    {showValue}
                  </span>
                </span>
              </Tooltip>
              {
                row.sellerMemo && (
                  !sellerMemoRead ? (
                    <i
                      className={`icon-sign_read ${styles.iconRead}`}
                      onClick={() => {
                        context.updateReadMark(saleOrderId, 'seller_memo_read');
                      }}
                    />
                  ) : (
                    <i
                      className={`icon-sure ${styles.sure}`}
                    />
                  )
                )
              }
            </div>
          ) : (
            <Tooltip
              placement="bottom"
              title={row.sellerMemo}
            >
              <span style={{ display: 'flex' }}>
                <SellerFlagElement
                  parent={context}
                  sellerFlags={sellerFlags}
                />
                <span>
                  {showValue}
                </span>
              </span>
            </Tooltip>
          )
        );
      },
    },
    {
      key: 'courierId',
      name: '快递',
      width: 120,
      formatter: ({ row }) => {
        const dict = dealDict(context, 'courier_id-4-14');
        const name = dict[row.courierVo?.courierId] || '未设置';
        const dictNameLengthList = context.programme.filterItems.dict['courier_id-4-14']?.map((item) => item.label.length);
        const maxLong = dictNameLengthList ? Math.max(...dictNameLengthList) : 0;
        const rowSelected = orderType && context.programme?.gridModel?.gridModel?.cursorRow?.saleOrderId === row.saleOrderId;
        return row.isChecked === 1 || row.orderType === 6 || !rowSelected ? (
          <span>
            {name}
          </span>
        ) : (
          <Select
            defaultValue={name}
            dropdownMatchSelectWidth={name.length < maxLong ? (maxLong * 14 + 14) : true}
            onChange={(value, option) => {
              context.handleChangeCourierOrWarehouse(true, option, row);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {context.programme.filterItems.dict['courier_id-4-14']?.map((item) => (
              <Select.Option
                key={item.value}
                value={item.label}
              >
                {item.label}
              </Select.Option>
            ))}
          </Select>
        );
      },
      sortable: true,
    },
    {
      key: 'receiverAddress',
      name: '收货信息',
      width: 200,
      formatter: ({ row }) => {
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          >
            <Tooltip
              placement="bottom"
              title={row.receiverVo ? row.receiverVo.receiverState + row.receiverVo.receiverCity + row.receiverVo.receiverDistrict : ''}
            >
              <span style={{
                width: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              >
                {row.receiverVo && (row.receiverVo.receiverState + row.receiverVo.receiverCity + row.receiverVo.receiverDistrict)}
              </span>
            </Tooltip>
            {
              orderType && row.receiverVo?.receiverAddress ? (
                <Tooltip
                  placement="bottom"
                  title="点击修改收货信息"
                >
                  <i
                    className="icon-edit"
                    onClick={() => {
                      context.modifyReceiverInfoStore.openModal(row);
                    }}
                    style={{
                      color: '#1978ff',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
              ) : null
            }
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'warehouseId',
      name: '仓库',
      width: 130,
      formatter: ({ row }) => {
        const dict = dealDict(context, 'warehouse_id-4-13');
        const name = dict[row.warehouseId] || '未设置';
        const rowSelected = orderType && context.programme?.gridModel?.gridModel?.cursorRow?.saleOrderId === row.saleOrderId;
        return row.isChecked === 1 || row.orderType === 6 || !rowSelected || (row.proxySendStatus && row.proxySendStatus !== 3) ? (
          <span>
            {name}
          </span>
        ) : (
          <Select
            defaultValue={name}
            onChange={(value, option) => {
              context.handleChangeCourierOrWarehouse(false, option, row);
            }}
            onClick={(e) => e.stopPropagation()}
            optionFilterProp="children"
            showSearch
            style={{ width: '110px' }}
          >
            {context.programme.filterItems.dict['warehouse_id-4-13']?.map((item) => (
              <Select.Option
                key={item.value}
                value={item.label}
              >
                {item.label}
              </Select.Option>
            ))}
          </Select>
        );
      },
      sortable: true,
    },
    {
      key: 'shopId',
      name: '店铺',
      width: 100,
      formatter: ({ row }) => {
        const dict = {};
        context?.shopList?.forEach((item) => {
          Object.assign(dict, { [item.value]: item.label });
        });
        const name = dict[row.shopId] || '未知店铺';
        let shopName: React.ReactNode = null;
        if (name.length > 6) {
          shopName = (
            <Tooltip
              placement="bottom"
              title={name}
            >
              <span>
                {name}
              </span>
            </Tooltip>
          );
        } else {
          shopName = (
            <span>
              {name}
            </span>
          );
        }
        const iconUrl = context.getPlatformIconByCode?.(row.platformType);
        return (
          <Space>
            {iconUrl ? (
              <img
                height={30}
                src={iconUrl}
                width={30}
              />
            ) : null}
            {shopName}
          </Space>
        );
      },
      sortable: true,
    },
    {
      key: 'buyerNick',
      name: '买家昵称',
      width: 200,
      sortable: true,
      formatter: ({ row }) => {
        const visible = Boolean(row.buyerVo?.buyerNick);
        if (!visible) {
          return null;
        }
        if (row.platformType !== 1) {
          const params = getAppRedirectUrl(row.platformType, {
            buyerNick: row.buyerVo?.buyerNick,
            shopName: row.shopName,
            platformOrderCode: row.platformOrderCode,
          });
          return (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            >
              <div
                className={`${styles.overEllipsis} ${styles.redirectUrl}`}
                style={{ width: 'auto' }}
              >
                <a
                  className={styles.wangwangLink}
                  target="_blank"
                  {...params}
                  style={params.href && row.platformType !== 22 ? undefined : { display: 'none' }}
                >
                  <img
                    onDragStart={(e) => {
                      e.preventDefault();
                    }}
                    src={params.icon}
                  />
                </a>
                <Tooltip
                  placement="topLeft"
                  title={row.buyerVo?.buyerNick}
                >
                  <span>
                    {row.buyerVo?.buyerNick}
                  </span>
                </Tooltip>

              </div>
              {row.buyerVo?.buyerNick && (
                <Tooltip
                  placement="bottom"
                  title="点击复制"
                >
                  <span onClick={context.copyText}>
                    <CopyOutlined
                      style={{
                        color: '#1978ff',
                        marginLeft: '4px',
                        cursor: 'pointer',
                      }}
                    />
                  </span>
                </Tooltip>
              )}

            </div>

          );
        }

        if (row.appKey) {
          setTimeout(() => {
            const newWindow: any = window;
            newWindow?.Light?.init();
          });
        }
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          >
            <div
              className={styles.overEllipsis}
              style={{ width: 'auto' }}
            >

              <span
                className="J_WangWang"
                data-appkey={row.appKey}
                data-bizdomain={row.bizDomain}
                data-biztype={1}
                data-display="inline"
                data-encryptuid={row?.buyerVo?.buyerOpenUid || ''}
                data-icon="small"
                data-nick={row.buyerVo?.buyerNick}
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              <Tooltip
                placement="topLeft"
                title={row.buyerVo?.buyerNick}
              >
                <span>
                  {row.buyerVo?.buyerNick}
                </span>
              </Tooltip>

            </div>
            {row.buyerVo?.buyerNick && (
              <Tooltip
                placement="bottom"
                title="点击复制"
              >
                <span onClick={context.copyText}>
                  <CopyOutlined
                    style={{
                      color: '#1978ff',
                      marginLeft: '4px',
                      cursor: 'pointer',
                    }}
                  />
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      key: 'courierPrintMarkState',
      name: '是否打印',
      align: 'center',
      width: 80,
      formatter: ({ row }) => (row.courierVo?.courierPrintMarkState === 1 ? (
        <span style={{ color: '#f75200' }}>
          未打印
        </span>
      ) : (
        <span style={{ color: '#116e03' }}>
          已打印
        </span>
      )),
      sortable: true,
    },
    {
      key: 'courierOrderNo',
      name: (<div className={styles.saleOrderNoHeader}>
        快递单号
        <Tooltip
          placement="bottom"
          title="点击复制"
        >
          <span
            className={`icon-copy ${styles.copyMutilColumnsText}`}
            onClick={(e) => context.copyMutilColumnsText(e, 'courierVo.courierOrderNo')}>
          </span>
        </Tooltip>
      </div>),
      width: 300,
      formatter: ({ row }) => {
        const dict = dealDict(context, 'courier_id-4-14');
        const name = dict[row.courierVo?.courierId] || '未设置';
        return (
          <div className={styles.courierOrderNo}>
            <span
              className={styles.overEllipsis}
              style={{ width: 120 }}
            >
              {row.courierVo?.courierOrderNo}
            </span>
            {
              row.courierVo?.courierOrderNo && (
                <img
                  className={styles.courierOrderNoImage}
                  onClick={() => {
                    context.courierQueryStore.onOpen(row.courierVo.courierOrderNo, row.saleOrderId, row.platformType, {
                      ...(row?.courierVo || {}),
                      courierName: name,
                    });
                  }}
                  onDragStart={(e) => e.preventDefault()}
                  src={getStaticResourceUrl('customer-source/courierOrderNo.png')}
                  style={{ marginLeft: '4px' }}
                />
              )
            }
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'totalNum',
      name: '总件数',
      width: 80,
      sortable: true,
    },
    {
      key: 'totalSku',
      name: '总条数',
      width: 80,
      sortable: true,
    },
    {
      key: 'postFee',
      name: '邮费',
      width: 80,
      sortable: true,
      formatter: ({ row }) => {
        return (
          <span>
            {row.saleOrderFinanceVo?.postFee}
          </span>
        );
      },
    },
    {
      key: 'payTime',
      name: '付款时间',
      width: 180,
      sortable: true,
    },
    {
      key: 'courierPrintTime',
      name: '打印时间',
      width: 180,
      sortable: true,
      formatter: ({ row }) => {
        return (
          <span>
            {row.courierVo?.courierPrintTime}
          </span>
        );
      },
    },
    {
      key: 'estimatedLogisticsTime',
      name: '预计发货时间',
      width: 180,
      sortable: true,
      formatter: ({ row }) => {
        return (
          <span>
            {row.courierVo?.estimatedLogisticsTime}
          </span>
        );
      },
    },
    {
      key: 'checkedTime',
      name: '验货时间',
      width: 180,
      sortable: true,
    },
    {
      key: 'suspendNote',
      name: '挂起说明',
      width: 180,
    },
    {
      key: 'platformOrderStatus',
      name: '平台状态',
      width: 180,
    },
    {
      key: 'purchaseState',
      name: '采购状态',
      width: 180,
      formatter: ({ row }) => {
        const dict = dealDict(context, 'purchase_state-4-13');
        const name = dict[row.purchaseState] || '';
        return (
          <span>
            {name}
          </span>
        );
      },
    },
    {
      key: 'tradeFrom',
      name: '设备来源',
      width: 100,
      formatter: ({ row }) => {
        const dict = dealDict(context, 'trade_from-4-10');
        const name = dict[row.tradeFrom] || '';
        return (
          <span>
            {name}
          </span>
        );
      },
    },
    {
      key: 'groupNo',
      name: '组号',
      width: 60,
    },
    {
      key: 'netWeightSum',
      name: '净重',
      width: 60,
    },
    {
      name: '剩余发货时间',
      key: 'remainingDeliveryTime',
      width: 150,
      sortable: orderType,
      sidx: 'deadlineLogisticsTime',
      formatter: ({ row }) => (
        <span>
          {context.remainingDeliveryTime(row)}
        </span>
      ),
    },
    {
      name: '截止发货时间',
      key: 'deadlineLogisticsTime',
      width: 160,
      sortable: true,
    },
    {
      name: '达人ID',
      key: 'authorId',
      width: 100,
      ejlHidden: !orderType,

    },
    {
      name: '达人名称',
      key: 'authorName',
      width: 100,
      ejlHidden: !orderType,
    },
    {
      name: '平台优惠',
      key: 'platformDiscountFee',
      width: 110,
      sortable: true,
      formatter: ({ row }) => {
        const discountFee = row?.platformDiscountFee;
        return (
          <span>
            {discountFee}
          </span>
        );
      },
    },
    {
      key: 'systemMemo',
      name: '订单备注',
      width: 300,
      ejlHidden: true,
    },
    {
      key: 'payTypeDesc',
      name: '支付方式',
      width: 80,
      ejlHidden: true,
    },
    {
      key: 'created',
      name: '下单时间',
      width: 150,
      sortable: true,
    },
    {
      key: 'createdAt',
      name: '获取时间',
      width: 150,
      formatter: ({ row }) => {
        return (
          <span>
            {row.commonBaseVo?.createdAt}
          </span>
        );
      },
      ejlHidden: true,
    },
    {
      name: '审核时间',
      key: 'omsCheckedTime',
      width: 150,
      ejlHidden: true,
    },
    {
      name: '重量',
      key: 'weight',
      width: 80,
      ejlHidden: true,
    },
    {
      name: '系统发货状态',
      key: 'wmsOrderStateDesc',
      width: 110,
      ejlHidden: true,
    },
    {
      name: '买家实付',
      key: 'payment',
      width: 120,
      formatter: ({ row }) => {
        return row.saleOrderFinanceVo?.payment;
      },
      sortable: true,
    },
    {
      name: '订单总金额',
      key: 'orderTotalFee',
      width: 120,
      formatter: ({ row }) => {
        return row.saleOrderFinanceVo?.totalFee;
      },
    },
    {
      name: '店铺优惠',
      key: 'shopDiscountFee',
      width: 120,
      sortable: true,
      formatter: ({ row }) => {
        return row.saleOrderFinanceVo?.shopDiscountFee;
      },
    },
    {
      name: '优惠总金额',
      key: 'discountFee',
      width: 120,
      formatter: ({ row }) => {
        return row.saleOrderFinanceVo?.discountFee;
      },
    },
    {
      name: '商家实收',
      key: 'actualProceedsFee',
      width: 120,
      sortable: true,
      formatter: ({ row }) => {
        return row.saleOrderFinanceVo?.actualProceedsFee;
      },
    },
    {
      key: 'platformLogisticsTime',
      name: '平台发货时间',
      width: 180,
    },
  ];
};
