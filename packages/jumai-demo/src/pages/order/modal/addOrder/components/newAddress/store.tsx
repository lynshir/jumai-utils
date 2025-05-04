import type { FormInstance } from 'antd';
import { message } from 'antd';
import type { BaseData } from 'jumai-common';
import { request } from 'jumai-common';
import { action, observable } from 'mobx';
import React from 'react';
import type { City, District, Option, ParsingAddress, Province } from './interface';
import type ParentStore from '../../addOrderStore';

export class AddressModalStore {
  constructor(parent: ParentStore) {
    this.parent = parent;
    this.queryProvince();
  }

  @observable
  public parent: ParentStore;

  @observable
  public visible = false;

  @observable
  public loading = false;

  @observable
  public ref: FormInstance;

  @observable
  public type: 'add' | 'edit' = 'add';

  @observable
  public mallReceiverAddressId: number;

  @observable
  public addressOptions: Option[] = [];

  @observable
  public address = '';

  @observable
  public confirmLoading = false;

  @action
  public setRef = (ref: FormInstance): void => {
    this.ref = ref;
  };

  @action
  public onShow = (type: 'add' | 'edit', id?: number, row?: {[key: string]: number | string; }) => {
    this.type = type;
    this.visible = true;
    if (id) {
      this.mallReceiverAddressId = id;
      this.queryAllAddress(row);
    }
  };

  // 请求省份
  @action
  public queryProvince = async(): Promise<void> => {
    const res: BaseData<Province[]> = await request({ url: '/api/infrastructure/region/provinces' });
    this.addressOptions = res?.data?.map((el) => {
      return {
        label: el.provinceName,
        value: `${el.id}`,
        isLeaf: false,
      };
    });
  };

  // 请求城市
  @action
  public queryCity = async(provinceId: string | number): Promise<Option[]> => {
    const res: BaseData<City[]> = await request({ url: `/api/infrastructure/region/cities?provinceId=${provinceId}` });
    const cityList = res?.data?.map((el) => {
      return {
        label: el.cityName,
        value: `${el.id}`,
        isLeaf: false,
      };
    });
    return Promise.resolve(cityList);
  };

  // 请求地区
  @action
  public queryDistrict = async(cityId: string | number): Promise<Option[]> => {
    const res: BaseData<District[]> = await request({ url: `/api/infrastructure/region/districts?cityId=${cityId}` });
    const districtList = res?.data?.map((el) => {
      return {
        label: el.districtName,
        value: `${el.id}`,
        isLeaf: true,
      };
    });
    return Promise.resolve(districtList);
  };

  // 城市id和区县id可能重复，要分开计算
  public loadData = async(selectedOptions: Option[]): Promise<void> => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    if (selectedOptions.length === 1) {
      targetOption.children = await this.queryCity(targetOption.value);
      targetOption.loading = false;
      const current = this.addressOptions.find((e) => e.value === targetOption.value);
      current.children = targetOption.children;
      current.loading = false;
      this.addressOptions = [...this.addressOptions];
    } else if (selectedOptions.length === 2) {
      const district = await this.queryDistrict(targetOption.value);
      targetOption.loading = false;
      targetOption.children = district;
      const province = this.addressOptions.find((i) => i.value === selectedOptions[0].value);
      const city = province.children?.find((i) => i.value === targetOption.value);
      city.children = district;
      city.loading = false;
      this.addressOptions = [...this.addressOptions];
    }
  };

  @action
  public onParserAddressChange = (e): void => {
    this.address = e.target.value;
  };

  // 请求具体省市区
  @action
  private queryDetailAddress = async(provinceId: string, cityId: string): Promise<void> => {
    // 请求具体地址
    const districtList = await this.queryDistrict(cityId);
    const cityList = await this.queryCity(provinceId);
    const targetCity = cityList.find((el) => el.value === `${cityId}`);
    targetCity.children = districtList;
    await this.queryProvince();
    const targetProvince = this.addressOptions.find((el) => el.value === `${provinceId}`);
    targetProvince.children = cityList;
    this.addressOptions = [...this.addressOptions];
  };

  // 地址解析请求
  @action
  public parsingAddress = async(): Promise<void> => {
    if (!this.address) {
      return;
    }

    this.loading = true;
    try {
      const res: BaseData<ParsingAddress> = await request({
        url: '/api/infrastructure/address/parse',
        method: 'post',
        data: { address: this.address },
      });
      this.loading = false;
      const {
        provinceId,
        cityId,
        districtId,
        province,
        city,
        district,
        detail,
        phone,
        name,
      } = res?.data;

      if (provinceId && cityId && districtId) {
        await this.queryDetailAddress(provinceId, cityId);
        this.ref.setFieldsValue({
          receiverName: name,
          receiverMobile: phone,
          address: [
            provinceId,
            cityId,
            districtId,
          ],
          receiverAddress: detail,
        });
      } else {
        message.info('解析失败');
      }
    } catch (err) {
      this.loading = false;
    }
  };

  public onCancel = (): void => {
    this.visible = false;
    this?.ref.resetFields();
    this.address = '';
    this.loading = false;
    this.mallReceiverAddressId = undefined;
  };

  // 编辑回显地址

  @action
  private queryAllAddress = async(row?: {[key: string]: number | string; }) => {
    this.loading = true;
    const {
      provinceId,
      cityId,
      districtId,
      addressName,
      mobile,
      fullAddress,
      defaultAddress,
    } = row;
    const districtList = await this.queryDistrict(cityId);
    const cityList = await this.queryCity(provinceId);
    const targetCity = cityList.find((el) => el.value === `${cityId}`);

    targetCity.children = districtList;
    const targetProvince = this.addressOptions.find((el) => el.value === `${provinceId}`);
    targetProvince.children = cityList;

    this.ref?.setFieldsValue({
      receiverName: addressName,
      receiverMobile: mobile,
      receiverAddress: fullAddress,
      address: [
        `${provinceId}`,
        `${cityId}`,
        `${districtId}`,
      ],
      defaultAddress,
    });
    this.loading = false;
  };

  // 保存
  @action public onOk = () => {
    this.confirmLoading = true;
    this.ref?.validateFields()
      .then(() => {
        const {
          receiverName,
          receiverMobile,
          address,
          receiverAddress,
          defaultAddress,
        } = this.ref.getFieldsValue();
        const [
          provinceId,
          cityId,
          districtId,
        ] = address;
        console.log('address....', address);
        const targetProvince = this.addressOptions.find((el) => el.value === provinceId);
        const targetCity = targetProvince.children.find((el) => el.value === cityId);
        const targetDistrict = targetCity.children.find((el) => el.value === districtId);
        const params = {
          addressName: receiverName,
          mobile: receiverMobile,
          fullAddress: receiverAddress,
          defaultAddress: 0,
          province: targetProvince.label,
          city: targetCity.label,
          district: targetDistrict.label,
          provinceId,
          cityId,
          districtId,
          id: this.mallReceiverAddressId,
          addressType: this.parent.activeKey === '1' ? 1 : 0,
        };
        if (this.parent.activeKey === '2') {
          params.defaultAddress = defaultAddress ? 1 : 0;
        }
        const url = this.mallReceiverAddressId ? '/api/baseinfo/rest/address/updateAddress' : '/api/baseinfo/rest/address/addAddress';
        return request({
          url,
          method: 'post',
          data: params,
        })
          .then((res: BaseData<unknown>) => {
            message.success(res?.info || ('新建成功'));
            this.onCancel();
          });
      })
      .finally(() => {
        this.confirmLoading = false;
      });
  };
}
