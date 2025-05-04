import type { FormInstance } from 'antd';
import { message } from 'antd';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { action, computed, observable } from 'mobx';
import React from 'react';
import { decryption } from '../../../../utils';
import { api } from '../../../../utils/api';

interface IProvince{
  province_id: string;
  province_name: string;
}

interface IAdressResult{
  province_id: string;
  city_id: string;
  district_id: string;
  province: string;
  city: string;
  district: string;
  phone: string;
  name: string;
  detail: string;
}

interface IPlainText{
  receiverMobile: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  receiverState?: string;
  receiverCity?: string;
  receiverDistrict?: string;
}

export default class Store {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public visible = false;

  public formRef = React.createRef<FormInstance>();

  @observable public loading = false;

  @observable public showSpin = false;

  @observable public copyText = '';

  @observable public saleOrderId;

  @observable public provinceList;

  @observable public cityList;

  @observable public districtList;

  @observable public disabled = true;// 表格是否可填写

  @observable public modifyFlag = false;// 状态是否为修改表格

  @observable public modifyButtonDisabled = false;// 修改按钮是否禁用

  // 抖音-是否是虚拟号
  @observable public virtualTel = false;

  // 淘宝-是否是虚拟号
  @observable public isTaobaoVirtualTel = false;

  // 抖音虚拟号
  @observable public virtualNo: string;

  @computed
  public get params() {
    const { platformType, shopId, platformOrderCode, saleOrderId, originType } = this.parent?.mainGridModel?.gridModel?.cursorRow;
    return {
      platformType,
      shopId,
      platformOrderCode,
      saleOrderId,
      originType,
    };
  }

  // 主表打开弹窗
  @action public openModal = (row): void => {
    this.visible = true;
    this.showSpin = true;
    const { saleOrderId, receiverVo, isChecked } = row;
    this.saleOrderId = saleOrderId;
    this.modifyButtonDisabled = Boolean(isChecked);

    this._init().then(() => {
      const { receiverNameBlur, receiverName, receiverMobileBlur, receiverMobile, receiverAddress, receiverState, receiverCity, receiverDistrict, receiverTown } = receiverVo;

      // 回写其他数据
      this.formRef.current?.setFieldsValue({
        receiverNameBlur: receiverName,
        receiverMobileBlur: receiverMobile,
        receiverAddress,
      });

      // 回写省市区
      this.reWritePCD(receiverState, receiverCity, receiverDistrict, receiverTown);
    })
      .finally(() => {
        this.showSpin = false;
      });
  };

  // 订单详情内打开弹窗
  @action public openModalByDetail = (receiverData) => {
    const { saleOrderId, receiverState, receiverCity, receiverDistrict, receiverTown } = receiverData;
    this.saleOrderId = saleOrderId;
    this._init().then(() => {
      // 回写省市区
      this.reWritePCD(receiverState, receiverCity, receiverDistrict, receiverTown);
    });

    // 置于修改态
    this.changeModalStatus();
    this.visible = true;
  };

  // 将弹窗置于修改收货信息状态
  @action public changeModalStatus = (): void => {
    this.formRef.current?.resetFields();
    this.modifyFlag = true;
    this.disabled = false;
  };

  @action public closeModal = (): void => {
    this.formRef.current?.resetFields();
    this.saleOrderId = null;
    this.disabled = true;// 表格disabled
    this.modifyFlag = false;
    this.loading = false;
    this.visible = false;

    this.virtualTel = false;
    this.isTaobaoVirtualTel = false;
    this.virtualNo = undefined;
  };

  @action public onCopy = async() => {
    const res = await decryption(this.params.platformType, this.params.saleOrderId, '', this.params);
    try {
      const { receiverState, receiverCity, receiverDistrict } = this.parent?.mainGridModel?.gridModel?.cursorRow?.receiverVo;

      const { receiverName, receiverMobile, receiverAddress } = res;
      const copyText = `${receiverName },${ receiverMobile },${ receiverState }${ receiverCity }${ receiverDistrict }${receiverAddress}`;

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.setAttribute('value', copyText);
      input.select();
      if (document.execCommand('copy')) {
        document.execCommand('copy');
        message.success('已复制地址');
      }
      document.body.removeChild(input);
    } catch (e) {
      console.error(e);
    }
  };

  @action public analysisAddress = (): void => {
    const address = this.formRef.current?.getFieldValue('receiverAddress');
    if (!address) {
      return;
    }

    // 发送解析请求
    request<BaseData<IAdressResult>>({
      url: api.parseAddress,
      method: 'POST',
      data: { address },
    }).then((res) => {
      // 不能直接用解析返回的id写
      const { province, city, district, name, phone, detail } = res.data;
      this.reWritePCD(province, city, district);
      const { setFieldsValue } = this.formRef.current;
      setFieldsValue({
        receiverNameBlur: name,
        receiverMobileBlur: phone,
        receiverAddress: detail,
      });
    });
  };

  @action public formItemOnChange = (keyName: string, val): void => {
    const { setFieldsValue } = this.formRef.current;
    if (keyName === 'receiverState') {
      setFieldsValue({
        receiverCity: '',
        receiverDistrict: '',
        receiverTown: '',
      }); // 清空市区镇
      this.getCityList(val);
    }

    if (keyName === 'receiverCity') {
      setFieldsValue({
        receiverDistrict: '',
        receiverTown: '',
      }); // 清空区镇
      this.getDistrictList(val);
    }

    if (keyName === 'receiverDistrict') {
      setFieldsValue({ receiverTown: '' }); // 清空镇
    }
  };

  // 查看收货人/手机原始数据
  @action public getPlaintextClick = async(decryptionField) => {
    const req = await decryption(this.params.platformType, this.params.saleOrderId, decryptionField, this.params);
    try {
      const params = {
        receiverNameBlur: req.receiverName,
        receiverMobileBlur: req.receiverMobile,
        receiverAddress: req.receiverAddress,
      };
      Object.keys(params).forEach((item) => {
        if (!params[item]) {
          delete params[item];
        }
      });
      this.formRef.current.setFieldsValue(params);
      this.virtualTel = Boolean(req.virtualTel);
      this.virtualNo = req.virtualNo;
      this.isTaobaoVirtualTel = Boolean(req.isTaobaoVirtualTel);
      message.success('成功获取收件人真实信息');
    } catch (e) {
      console.error(e);
    }
  };

  // 提交修改后的收货人信息
  @action public submitModifyInfo = () => {
    this.formRef.current?.validateFields().then((vals) => {
      this.loading = true;

      // 提交时无需解密
      // const { receiverName, receiverMobile } = await this.getPlaintextData();
      const { receiverNameBlur, receiverMobileBlur, receiverAddress, receiverTown } = vals;

      // 翻译省市区
      const selectedState = this.provinceList?.find((item) => item.value === vals.receiverState);
      const selectedCity = this.cityList?.find((item) => item.value === vals.receiverCity);
      const selectedDistrict = this.districtList?.find((item) => item.value === vals.receiverDistrict);

      const data = {
        saleOrderId: this.saleOrderId,
        receiverName: receiverNameBlur,
        receiverMobile: receiverMobileBlur,
        receiverPhone: receiverMobileBlur,
        receiverAddress,
        receiverState: selectedState.label,
        receiverCity: selectedCity.label,
        receiverDistrict: selectedDistrict.label,
        receiverTown,
      };
      request<BaseData>({
        url: api.updateReceiverInfo,
        method: 'POST',
        data,
      }).then((res) => {
        message.success('修改收货信息成功');
        this.parent.resetTable();
        this.parent.orderDetailsModel.getSaleOrder(this.saleOrderId);
        this.closeModal();
      })
        .finally(() => {
          this.loading = false;
        });
    });
  };

  @action private _init = (): Promise<unknown> => {
    return request<BaseData<any[]>>({
      url: '/api/infrastructure/region/provinces',
      method: 'GET',
    }).then((res) => {
      this.provinceList = this.mapOptions(res?.data || [], 'provinceName', 'id');
    });
  };

  @action public reWritePCD = (p, c, d, t?: string): void => {
    const { setFieldsValue } = this.formRef.current;
    const provinceId = this.getIdByName(p, this.provinceList);
    if (provinceId) {
      setFieldsValue({
        receiverState: provinceId,
        receiverTown: t,
      });
      this.getCityList(provinceId, c, d);
    }
  };

  @action public getDistrictList = (parent_id, initDistrict?): void => {
    request({
      url: '/api/infrastructure/region/districts',
      method: 'GET',
      params: { cityId: parent_id },
    }).then((res: BaseData) => {
      this.districtList = this.mapOptions(res?.data || [], 'districtName', 'id');
      if (initDistrict) {
        const districtId = this.getIdByName(initDistrict, this.districtList);
        const { setFieldsValue } = this.formRef.current;
        setFieldsValue({ receiverDistrict: districtId });
      }
    });
  };

  @action public getCityList = (parent_id, initCity?, initDistrict?): void => {
    request({
      url: '/api/infrastructure/region/cities',
      method: 'GET',
      params: { provinceId: parent_id },
    }).then((res: BaseData) => {
      this.cityList = this.mapOptions(res?.data || [], 'cityName', 'id');
      if (initCity) {
        const cityId = this.getIdByName(initCity, this.cityList);
        if (cityId) {
          const { setFieldsValue } = this.formRef.current;
          setFieldsValue({ receiverCity: cityId });
          this.getDistrictList(cityId, initDistrict);
        }
      }
    });
  };

  private mapOptions = (list, keyField, valField): void => {
    return list.map((item) => ({
      label: item[keyField],
      value: item[valField],
    }));
  };

  private getIdByName = (name, dict) => {
    if (Array.isArray(dict)) {
      const targetItem = dict.find((item) => item.label === name);
      if (targetItem) {
        return targetItem.value;
      }
    }
    return '';
  };
}
