import type { FormInstance } from 'antd';
import { message } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { action, computed, observable } from 'mobx';
import React from 'react';
import { copyMethods, decryption } from '../../../../../utils/index';
import type parentModel from '../../model';

interface SelectInterface {
  label: string;
  value: string;
}
interface ParsingInterface {
  province?: string;
  city?: string;
  district?: string;
  phone?: string;
  name?: string;
  detail?: string;
}

export default class {
  constructor(parent: parentModel) {
    this.parent = parent;
  }

  // 抖音-是否是虚拟号
  @observable public virtualTel = false;

  // 淘宝-是否是虚拟号
  @observable public isTaobaoVirtualTel = false;

  // 抖音虚拟号
  @observable public virtualNo: string;

  public parent: parentModel;

  public formRef = React.createRef<FormInstance>();

  public serFormValues = (obj) => {
    this.formRef.current.setFieldsValue(obj);
  };

  @computed
  public get platformType() {
    return this.parent?.currentRow?.platformType;
  }

  @computed
  public get params() {
    return {
      shopId: this.parent?.currentRow?.shopId,
      platformOrderCode: this.parent?.currentRow?.platformOrderCode,
      originType: this.parent?.currentRow?.originType,
    };
  }

  @action
  public getPlaintextClick = async(decryptionField?: string) => {
    const req = await decryption(this.platformType, this.parent.orderId, decryptionField, this.params);
    try {
      const fields = this.formRef.current.getFieldsValue();
      this.formRef.current.setFieldsValue({
        receiverNameBlur: req.receiverName || fields.receiverNameBlur,
        receiverMobileBlur: req.receiverMobile || fields.receiverMobileBlur,
        receiverAddress: {
          ...fields.receiverAddress,
          receiverAddressBlur: req.receiverAddress || fields.receiverAddress.receiverAddressBlur,
        },
      });
      this.virtualTel = Boolean(req.virtualTel);
      this.virtualNo = req.virtualNo;
      this.isTaobaoVirtualTel = Boolean(req.isTaobaoVirtualTel);
    } catch (e) {
      console.error(e);
    }
  };

  @action
  public getParsingAddressClick = async() => {
    try {
      const { receiverAddressBlur } = this.formRef.current.getFieldValue('receiverAddress');
      let _receiverAddressBlur = receiverAddressBlur;
      if (!_receiverAddressBlur) {
        return;
      }
      _receiverAddressBlur = _receiverAddressBlur.replace(new RegExp(/[,，；;。.]/, 'gm'), ' ');
      _receiverAddressBlur = _receiverAddressBlur.replace(/\s+/gm, ' ');
      await this.analysisAddress(_receiverAddressBlur);
    } catch (e) {
      console.error(e);
    }
  };

  public analysisAddress = async(address) => {
    console.log('analysisAddress');
    if (address) {
      const req = await request<BaseData<ParsingInterface>>({
        method: 'POST',
        url: '/api/infrastructure/address/parse',
        data: { address },
      });
      const fields = this.formRef.current.getFieldsValue();

      const { province, city, district, phone, name, detail } = req.data;
      this.formRef.current.setFieldsValue({
        receiverNameBlur: name || fields.receiverNameBlur,
        receiverMobileBlur: phone || fields.receiverMobileBlur,
        receiverAddress: {
          receiverAddressBlur: detail,
          receiverCity: city,
          receiverState: province,
          receiverDistrict: district,
        },
      });
    }
  };

  // 该方法用不上 现修改收货信息统一在弹窗内进行
  @action public onSave = async() => {
    const fields = this.formRef.current.getFieldsValue();
    const { receiverAddressBlur, receiverCity, receiverState, receiverDistrict } = fields.receiverAddress;
    const params = {
      saleOrderId: this.parent.orderId,
      receiverAddress: receiverAddressBlur,
      receiverCity,
      receiverState,
      receiverDistrict,
      receiverName: fields.receiverNameBlur,
      receiverMobile: fields.receiverMobileBlur,
      receiverPhone: fields.receiverMobileBlur,
    };
    await request<BaseData>({
      method: 'POST',
      url: '/api/oms/rest/receiver/update',
      data: params,
    });
    message.success('保存成功');
  };

  public openModifyModal = (): void => {
    const fields = this.formRef.current.getFieldsValue();
    const { receiverCity, receiverState, receiverDistrict, receiverTown } = fields.receiverAddress;
    const receiverInfo = {
      saleOrderId: this.parent.orderId,
      receiverCity,
      receiverState,
      receiverDistrict,
      receiverTown,
    };
    this.parent.parent.modifyReceiverInfoStore.openModalByDetail(receiverInfo);
  };

  @action
  public onCopy = async() => {
    const PlaintextData = await decryption(this.platformType, this.parent.orderId, this.platformType === 2 ? 'receiverMobileBlur' : '', this.params);
    try {
      const fields = this.formRef.current.getFieldsValue();
      const { receiverAddressBlur, receiverCity, receiverState, receiverDistrict } = fields.receiverAddress;
      const {
        receiverName,
        receiverMobile,
        receiverPhone,
        receiverAddress,
        receiverTown,
      } = PlaintextData;
      const content = `${receiverName},${receiverMobile ? receiverMobile : receiverPhone},${receiverState}${receiverCity}${receiverDistrict}${receiverTown || ''}${receiverAddress}`;
      copyMethods(content);
    } catch (e) {
      console.error(e);
    }
  };
}
