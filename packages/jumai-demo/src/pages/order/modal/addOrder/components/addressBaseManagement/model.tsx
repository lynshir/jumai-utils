import type { ModalProps } from 'antd';
import { action, computed, observable } from 'mobx';
import type ParentModel from '../../addOrderStore';
import { NormalProgramme, MainSubStructureModel, request } from 'jumai-utils';
import styles from './index.less';
import React from 'react';
import { message } from 'antd';

export default class Model {
  constructor(parent: ParentModel) {
    this.parent = parent;
    this.__init__();
  }

  @observable public openModal = false;

  @observable public confirmLoading = false;

  @observable public title: string;

  @observable public addressBaseNormalProgramme: NormalProgramme;

  @observable public addressBaseMainSubStructureModel: MainSubStructureModel;

  @observable public addresseeNormalProgramme: NormalProgramme; // 收件人

  @observable public addresseeMainSubStructureModel: MainSubStructureModel;// 收件人

  public parent: ParentModel;

  @action
  private __init__() {
    this.initAddressBase();
    this.initAddressee();
  }

  @action
  public onCancel = () => {
    this.openModal = false;
    this.confirmLoading = false;
    this.title = undefined;
    this.addressBaseNormalProgramme.reset();
    this.addresseeNormalProgramme.reset();
    this.addressBaseMainSubStructureModel.gridModel.clearToOriginal();
    this.addresseeMainSubStructureModel.gridModel.clearToOriginal();
  };

  @action
  private initAddressBase() {
    this.addressBaseNormalProgramme = new NormalProgramme({
      filterItems: [
        {
          type: 'input',
          field: 'addressName',
          label: '发件人姓名',
        },
      ],
      count: 4,
      handleSearch: () => {
        return this.addressBaseMainSubStructureModel.onQuery();
      },
    });
    this.addressBaseMainSubStructureModel = new MainSubStructureModel({
      buttons: [],
      grid: {
        columns: [
          {
            key: 'addressName',
            name: '发件人姓名',
            minWidth: 180,
          },
          {
            key: 'mobile',
            name: '发件人手机号',
            minWidth: 180,

          },
          {
            key: 'fullAddress',
            name: '发件人地址',
            minWidth: 280,
          },
          {
            key: 'createTime',
            name: '创建时间',
          },
        ].map((item) => ({
          resizable: true,
          draggable: true,
          ...item,
        })),
        primaryKeyField: 'id',
        showEmpty: true,
        sortByLocal: false,
        showRefresh: false,
        setColumnsDisplay: false,
      },
      api: {
        onQuery: (params) => {
          const {
            filterParams = {},
            ...rest
          } = params;
          return request({
            method: 'POST',
            url: '/api/baseinfo/rest/address/query',
            data: {
              ...rest,
              ...this.addressBaseNormalProgramme.filterItems.params,
              addressType: 1,
            },
          });
        },
      },
      hiddenSubTable: true,
    });
  }

  @action
  private initAddressee() {
    this.addresseeNormalProgramme = new NormalProgramme({
      filterItems: [
        {
          type: 'input',
          field: 'addressName',
          label: '收件人姓名',
        },
      ],
      count: 4,
      handleSearch: () => {
        return this.addresseeMainSubStructureModel.onQuery();
      },
    });
    this.addresseeMainSubStructureModel = new MainSubStructureModel({
      buttons: [],
      grid: {
        columns: [

          {
            key: 'addressName',
            name: '收件人姓名',
            minWidth: 180,
          },
          {
            key: 'mobile',
            name: '收件人手机号',
            minWidth: 180,

          },
          {
            key: 'fullAddress',
            name: '收件人地址',
            minWidth: 280,
          },
          {
            key: 'createTime',
            name: '创建时间',
            sortable: true,
          },
        ].map((item) => ({
          resizable: true,
          draggable: true,
          ...item,
        })),
        primaryKeyField: 'id',
        showEmpty: true,
        sortByLocal: false,
        showRefresh: false,
        setColumnsDisplay: false,
      },
      api: {
        onQuery: (params) => {
          const {
            filterParams = {},
            ...rest
          } = params;
          return request({
            method: 'POST',
            url: '/api/baseinfo/rest/address/query',
            data: {
              ...rest,
              ...this.addresseeNormalProgramme.filterItems.params,
              addressType: 0,
            },
          });
        },
      },
      hiddenSubTable: true,
    });
  }

  @action
  public onShow = () => {
    if (this.parent.activeKey === '2') {
      this.addresseeNormalProgramme.handleSearch();
    }
    if (this.parent.activeKey === '1') {
      this.addressBaseNormalProgramme.handleSearch();
    }
    this.openModal = true;
  };

  @action
  public onOk = () => {
    if (this.parent.activeKey === '1') {
      if (this.addressBaseMainSubStructureModel.gridModel.selectRows.length !== 1) {
        message.warning('请选择一位发件人！');
        return;
      }
      const { addressName, mobile, fullAddress, provinceId, cityId, districtId } = this.addressBaseMainSubStructureModel.gridModel.selectRows[0];
      this.parent.getSenderCityList(provinceId);
      this.parent.getSenderDistrictList(cityId);
      this.parent.orderFormRef.current.setFieldsValue({
        senderName: addressName,
        senderMobile: mobile,
        senderAddress: fullAddress,
        senderState: provinceId,
        senderCity: cityId,
        senderDistrict: districtId,
      });
    }
    if (this.parent.activeKey === '2') {
      if (this.addresseeMainSubStructureModel.gridModel.selectRows.length !== 1) {
        message.warning('请选择一位收件人！');
        return;
      }
      const { addressName, mobile, fullAddress, provinceId, cityId, districtId } = this.addresseeMainSubStructureModel.gridModel.selectRows[0];
      this.parent.getCityList(provinceId);
      this.parent.getDistrictList(cityId);
      this.parent.orderFormRef.current.setFieldsValue({
        receiverName: addressName,
        receiverMobile: mobile,
        receiverAddress: fullAddress,
        receiverState: provinceId,
        receiverCity: cityId,
        receiverDistrict: districtId,
      });
    }
    this.onCancel();
  };

  @computed
  public get getModalProps(): ModalProps {
    return {
      open: this.openModal,
      confirmLoading: this.confirmLoading,
      title: this.parent.activeKey === '1' ? '选择发件人' : '选择收件人',
      centered: true,
      destroyOnClose: true,
      maskClosable: false,
      width: 1100,
      onCancel: this.onCancel,
      onOk: this.onOk,
    };
  }
}
