import { ImgFormatter } from 'jumai-utils';
import React from 'react';
import { Popover } from 'antd';
import { getStaticResourceUrl, toFixed } from 'jumai-common';
import styles from './index.less';

export const tipContent = (limitPriceTips: boolean, limitSalePriceTips: boolean) => {
  return (
    <>
      <div>
        { limitPriceTips ? '平台商品单价低于达人直播价，下单不支持白条支付' : ''}
      </div>
      <div>
        {limitSalePriceTips ? '平台商品单价低于进货价，下单不支持白条支付' : ''}
      </div>
    </>
  );
};

export const egGridModelConfig = {
  primaryKeyField: 'gridKey',
  rows: [],
  columns: [
    {
      name: '图片',
      key: 'picUrl',
      width: 35,
      formatter: ({ row }) => {
        return (
          <ImgFormatter
            height={28}
            value={row.picUrl || getStaticResourceUrl('pc/ts/jumai-ts-oms/images/noPic.png')}
            width={28}
          />
        );
      },
    },
    {
      name: 'SKU编码',
      key: 'goodsSkuNo',
    },
    {
      name: '颜色',
      key: 'color',
      width: 80,
    },
    {
      name: '尺码',
      key: 'size',
      width: 80,
    },
    {
      name: '关联达人',
      key: 'authorId',
      width: 100,
      formatter: ({ row }) => {
        return (
          Number(row.authorId) !== -1 ? (
            <div className={styles.authorWrapper}>
              <div>
                {row.authorName}
              </div>
              <div>
                ID:
                {row.authorId}
              </div>
            </div>
          ) : (
            <div>
              -
            </div>
          )
          
        );
      },
    },
    {
      name: '达人结算价',
      key: 'authorPrice',
      width: 80,
      formatter: ({ row }) => {
        return (
          Number(row.authorId) !== -1
            ? (
              <span>
                &yen;
                {toFixed(row.authorPrice, 2)}
              </span>
            ) : (
              <span>
                -
              </span>
            )
        );
      },
    },
    {
      name: '达人直播价',
      key: 'authorLiveLimitPrice',
      width: 80,
      formatter: ({ row }) => {
        return (
          Number(row.authorId) !== -1
            ? (
              <span>
                &yen;
                {toFixed(row.authorLiveLimitPrice, 2)}
              </span>
            ) : (
              <span>
                -
              </span>
            )
        );
      },
    },
    {
      name: '进货价',
      key: 'price',
      width: 80,
      formatter: ({ row }) => {
        return (
          <span>
            &yen;
            {toFixed(row.price, 2)}
          </span>
        );
      },
    },
    {
      name: '平台商品单价',
      key: 'platformPrice',
      width: 100,
      formatter: ({ row }) => {
        return (
          <div className={styles.platformPriceWrapper}>
            &yen;
            {toFixed(row.platformPrice, 2)}
            {
              row.limitPriceTips || row.limitSalePriceTips ? (
                <Popover
                  content={tipContent(row.limitPriceTips, row.limitSalePriceTips)}
                  placement="bottom"
                >
                  <span className={styles.iconTip}>
                    !
                  </span>
                </Popover>
              ) : null
            }
          </div>
        );
      },
    },
    {
      name: '代发数量',
      key: 'num',
      width: 85,
    },
    {
      name: '退货规则',
      key: 'returnable',
      formatter: ({ row }) => {
        const rulesEnu = {
          '0': () => {
            return (
              <span className={styles.salesReturn}>
                不支持退货
              </span>
            );
          },
          '1': () => {
            return (
              <span className={styles.salesReturn}>
                {Number(row.returnRate)}
                %支持退货
              </span>
            );
          },
          '2': () => {
            return (
              <span className={`${styles.salesReturn} ${styles.returnService}`}>
                不支持退货，可购买无忧退货
              </span>
            );
          },
        };
        return rulesEnu[row.returnable]();
      },
    },
  ].map((item) => {
    return {
      draggable: true,
      resizable: true,
      ...item,
    };
  }),
  showPagination: false,
  showCheckBox: false,
  showPager: false,
};
