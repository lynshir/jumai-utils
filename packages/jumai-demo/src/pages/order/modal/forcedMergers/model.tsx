import { EyeOutlined } from '@ant-design/icons';
import type { ModalProps } from 'antd';
import { message, Radio } from 'antd';
import { request } from 'jumai-common';
import { EgGridModel } from 'jumai-utils';
import type { IEgGridModel, BaseData } from 'jumai-utils';
import { action, observable, set } from 'mobx';
import { observer } from 'mobx-react';

import React from 'react';
import { decryption } from '../../../../utils/index';
import type { IParentStore } from '../../store';
import styles from './index.less';

export default class ForcedMergersModel {
  constructor(params: { parent: IParentStore; }) {
    this._init();
    this.parent = params.parent;
  }

  @observable private visible = false;

  @observable private confirmLoading = false;

  @observable public parent: IParentStore;

  @observable public mainSaleOrderId: number;

  @observable private egGridModel: EgGridModel;

  @action
  private _init() {
    this.egGridModel = new EgGridModel(this.getEgGridModelParams);
  }

  @action
  private onOk = (): void => {
    if (!this.mainSaleOrderId) {
      message.error('请选择一个订单作为主订单！');
      return;
    }
    this.confirmLoading = true;
    request({
      method: 'POST',
      url: '/api/saleorder/rest/combine/force/combine',
      data: {
        combineSaleOrderIds: this.egGridModel.rows.filter((item) => item.saleOrderId !== this.mainSaleOrderId)
          .map((item) => item.saleOrderId),
        mainSaleOrderId: this.mainSaleOrderId,
      },
    })
      .then((req: BaseData) => {
        message.success(req.data);
        this.onCancel();
        this.parent.resetTable();
      })
      .catch((e) => {
        this.confirmLoading = false;
      });
  };

  @action
  private onCancel = () => {
    this.egGridModel.clearToOriginal();
    this.egGridModel.resetAll();
    this.egGridModel.rows = [];
    this.visible = false;
    this.confirmLoading = false;
    this.mainSaleOrderId = undefined;
  };

  @action
  public onOpen = (data: any[]) => {
    this.egGridModel.rows = data;
    this.mainSaleOrderId = data[0].saleOrderId;
    this.visible = true;
  };

  @action
  public onRadioChange = (row) => {
    this.mainSaleOrderId = row.saleOrderId;
  };

  private get getEgGridModelParams(): IEgGridModel {
    return {
      columns: [
        {
          key: 'radio_',
          name: '',
          width: 30,
          minWidth: 30,
          maxWidth: 30,
          cellClass: styles.cellClassRadio,
          formatter: observer(({ row }) => {
            return (
              <label
                className={styles.radio}
                onClick={(e) => e.stopPropagation()}
              >
                <Radio
                  checked={row.saleOrderId === this.mainSaleOrderId}
                  className={styles.saleOrder}
                  onChange={(e) => {
                    this.onRadioChange(row);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
            );
          }),
          frozen: true,
          resizable: false,

        },
        {
          key: 'serialNumber',
          name: '序号',
          minWidth: 40,
          width: 40,

          formatter: ({ row }) => {
            return (
              <div className={styles.serialNumber}>
                {row.serialNumber}
              </div>
            );
          },
          frozen: true,

          // resizable: false,
        },
        {
          key: 'platformOrderCode',
          name: '平台单号',
          width: 260,
        },
        {
          key: 'buyerNick',
          name: '买家昵称',
          width: 130,

        },
        {
          key: 'receiverName',
          name: '姓名',
          width: 100,
          formatter: ({ row }) => {
            return (
              <div className={styles.receiver}>
                <span>
                  {row.receiverName}
                </span>
                <EyeOutlined
                  className={styles.getPlaintext}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.getPlaintextClick('receiverName', row);
                  }}
                />
              </div>
            );
          },
        },
        {
          key: 'receiverMobile',
          name: '手机号',
          width: 140,
          formatter: ({ row }) => {
            return (
              <div className={styles.receiver}>
                <span>
                  {row.receiverMobile}
                </span>
                <EyeOutlined
                  className={styles.getPlaintext}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.getPlaintextClick('receiverMobile', row);
                  }}
                />
              </div>
            );
          },
        },
        {
          key: 'receiverState',
          name: '省',
        },
        {
          key: 'receiverCity',
          name: '市',
        },
        {
          key: 'receiverDistrict',
          name: '区',
        },
        {
          key: 'receiverAddress',
          name: '详细地址',
          width: 260,
          formatter: ({ row }) => {
            return (
              <div className={styles.receiver}>
                <span>
                  {row.receiverAddress}
                </span>
                <EyeOutlined
                  className={styles.getPlaintext}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.getPlaintextClick('receiverAddress', row);
                  }}
                />
              </div>
            );
          },
        },
      ].map((item) => {
        return {
          resizable: true,
          ...item,
        };
      }),
      rows: [],
      primaryKeyField: 'saleOrderId',
      forceRowClick: true,
      showCheckBox: false,
      showPager: false,
      showGridOrderNo: false,
      api: {
        onRowClick: action((rowId, row) => {
          this.mainSaleOrderId = Number(rowId);
        }),
      },
    };
  }

  @action
  public getPlaintextClick = async(decryptionField: string, row: any) => {
    const req = await decryption(row.platformType, row.saleOrderId, decryptionField, {
      shopId: row.shopId,
      platformOrderCode: row.platformOrderCode,
    });
    this.egGridModel.rows.forEach((item) => {
      if (item.saleOrderId === row.saleOrderId) {
        set(item, {
          ...item,
          receiverName: req.receiverName || item.receiverName,
          receiverMobile: req.receiverMobile || item.receiverMobile,
          receiverAddress: req.receiverAddress || item.receiverAddress,
        });
      }
    });
  };

  public get getModalParams(): ModalProps {
    return {
      open: this.visible,
      title: '强制合并',
      centered: true,
      okText: '强制合并',
      onOk: this.onOk,
      onCancel: this.onCancel,
      width: 1300,
      confirmLoading: this.confirmLoading,
    };
  }

  public get getEgGridModel() {
    return this.egGridModel;
  }
}
