import { Button, InputNumber, message } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { subtract, add, multiple } from 'jumai-common';
import type { PureData, BaseData } from 'jumai-utils';
import { request, ImgFormatter, EgGridModel } from 'jumai-utils';
import _ from 'lodash';
import { observable, action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { api } from '../../../../utils/api';
import type { SkuInfo, IAdressResult, IOrderInfo } from './interface';
import { AddressModalStore } from './components/newAddress/store';
import AddressBaseManagementModel from './components/addressBaseManagement/model';

export default class OrderStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public activeKey: string;

  @observable public showOrderModal = false;

  @observable public platTypeList;

  @observable public provinceList;

  @observable public cityList;

  @observable public citySenderList;

  @observable public districtList;

  @observable public districtSenderList;

  @observable public amFlag = false;// 新建或复制新建 复制新建为true

  @observable public totalInfo = {
    totalNum: 0,
    totalSku: 0,
    totalFee: 0,
    orderFee: 0,
    postFee: 0,
    discountFee: 0,
    payment: 0,
  };

  @observable public orderFormRef = React.createRef<FormInstance>();

  @observable public querySkuRef = React.createRef<FormInstance>();

  @observable public productIds = [];

  @observable public productGridModel = new EgGridModel({
    columns: [
      {
        key: 'oeration',
        name: '操作',
        formatter: ({ row }) => {
          return (
            <Button
              onClick={() => {
                this.deleteProduct(row.skuId);
              }}
              type="link"
            >
              删除
            </Button>
          );
        },
        frozen: true,
      },
      {
        key: 'pic',
        name: '图片',
        formatter: ({ row }) => {
          return (
            <ImgFormatter
              height={60}
              value={row.pic}
              width={60}
            />
          );
        },
      },
      {
        key: 'productNo',
        name: '商品编码',
      },
      {
        key: 'skuNo',
        name: 'SKU编码',
      },
      {
        key: 'colorType',
        name: '颜色',
      },
      {
        key: 'sizeType',
        name: '尺码',
      },
      {
        key: 'num',
        name: '订货数量',
        formatter: observer(({ row }) => {
          return (
            <InputNumber

              // defaultValue={row.num}
              max={9999999}
              min={1}
              onChange={(value) => {
                this.onNumOrUnitChange('num', row.skuId, Number(value));
              }}
              precision={0}
              style={{ width: '100%' }}
              value={row.num}
            />
          );
        }),
      },
      {
        key: 'price',
        name: '单价',
        formatter: observer(({ row }) => {
          return (
            <InputNumber
              defaultValue={row.price}
              min={0}
              onChange={(value) => {
                this.onNumOrUnitChange('unit', row.skuId, Number(value));
              }}
              precision={2}
              style={{ width: '100%' }}
            />
          );
        }),
      },
      {
        key: 'salePrice',
        name: '销售价',
      },
      {
        key: 'payment',
        name: '实付金额',
        formatter: observer(({ row }) => {
          return (
            <InputNumber
              disabled
              id={`${row.skuId}_realPrice`}
              style={{ width: '100%' }}
              value={row.payment}
            />
          );
        }),
      },
      {
        key: 'spec',
        name: '规格',
      },
    ].map((item) => ({
      ...item,
      resizable: true,
      draggable: true,
    })),
    rows: [],
    primaryKeyField: 'skuId',
    showCheckBox: false,
    showPager: false,
  });

  @observable public submitLoading = false;

  public addressModalStore = new AddressModalStore(this);

  public addressBaseManagementModel = new AddressBaseManagementModel(this);

  @action
  public setActiveKey = (activeKey: string, type: 1 | 2) => {
    this.activeKey = activeKey;
    if (type === 1) {
      this.addressModalStore.onShow('add');
    } else {
      this.addressBaseManagementModel.onShow();
    }
  };

  @action public openOrderModal = (amFlag: boolean, saleOrderId?: number): void => {
    this.amFlag = amFlag;
    this.initDict().then(() => {
      saleOrderId && this.initOrderForm(saleOrderId);
    });
    this.showOrderModal = true;
  };

  // 初始化表单内容(用于复制新建)
  @action public initOrderForm = (saleOrderId: number): void => {
    request<BaseData<IOrderInfo>>({
      url: api.querySaleOrder,
      method: 'POST',
      data: { saleOrderId },
    }).then((res) => {
      const { shopId, totalNum, totalSku, payType, platformType, buyerVo, warehouseId, sellerMemo, courierVo, receiverVo, senderVo, saleOrderFinanceVo, saleOrderDetailVoList } = res.data;
      const { courierId } = courierVo;
      const { buyerNick, buyerMessage } = buyerVo;
      const { receiverState, receiverCity, receiverDistrict, receiverName, receiverPhone, receiverMobile, receiverAddress } = receiverVo;
      const { senderAddress, senderMobile, senderName } = senderVo;
      const { payment, postFee, discountFee, totalFee } = saleOrderFinanceVo;
      this.totalInfo = {
        totalSku: Number(totalSku || 0),
        payment: Number(payment || 0),
        postFee: Number(postFee || 0),
        orderFee: Number(totalFee) + Number(postFee),
        discountFee: Number(discountFee || 0),
        totalFee: Number(totalFee || 0),
        totalNum: Number(totalNum || 0),
      };
      console.log(this.totalInfo.postFee);

      // 写入表单数据
      this.orderFormRef.current?.setFieldsValue({
        shopId: String(shopId || ''),
        warehouseId: String(warehouseId || ''),
        platformType: String(platformType || ''),
        payType: String(payType || 0), // 付款方式默认在线支付
        courierId: String(courierId || ''),
        totalNum,
        sellerMemo,
        buyerNick,
        buyerMessage,
        receiverName,
        receiverMobile: receiverMobile || receiverPhone,
        receiverAddress,
        senderAddress,
        senderMobile,
        senderName,
        postFee: this.totalInfo.postFee,
      });

      // 回写省市区
      this.reWritePCD(receiverState, receiverCity, receiverDistrict);

      // 处理商品
      this.productGridModel.rows = saleOrderDetailVoList.map((item) => ({
        colorType: item.showSkuVo.colorType,
        sizeType: item.showSkuVo.sizeType,
        count: item.num || 1,
        num: item.num || 1,
        pic: item.showSkuVo.pic,
        salePrice: Number(item.showSkuVo.salePrice || 0),
        price: Number(item.saleOrderDetailFinanceVo.price || 0),
        payment: Number(item.saleOrderDetailFinanceVo.payment || 0),
        skuId: item.showSkuVo.id,
        spec: item.showSkuVo.spec,
        productNo: item.showSkuVo.productNo || '',
        skuNo: item.showSkuVo.skuNo,
      }));

      // 表中已有productIds用于新增比较
      this.productIds = saleOrderDetailVoList.map((item) => item.showSkuVo.id);
    });
  };

  // 关闭弹窗
  @action public handleCloseOrderModal = (): void => {
    this.orderFormRef.current?.resetFields();
    this.querySkuRef.current?.resetFields();
    this.cityList = [];
    this.citySenderList = [];
    this.districtList = [];
    this.districtSenderList = [];
    this.totalInfo = {
      totalNum: 0,
      totalSku: 0,
      totalFee: 0,
      orderFee: 0,
      postFee: 0,
      discountFee: 0,
      payment: 0,
    };
    this.productIds = [];
    this.productGridModel.rows = [];
    this.showOrderModal = false;
  };

  // 提交信息
  @action public handleSubmit = (): void => {
    if (this.submitLoading) {
      return;
    }
    this.orderFormRef.current?.validateFields().then((vals) => {
      // 判断商品是否添加
      if (!this.productGridModel.rows.length) {
        message.warn('请添加商品！');
        return;
      }

      this.submitLoading = true;

      // 翻译省市区
      const selectedState = this.provinceList.find((item) => item.value === vals.receiverState);
      const selectedCity = this.cityList.find((item) => item.value === vals.receiverCity);
      const selectedDistrict = this.districtList.find((item) => item.value === vals.receiverDistrict);

      // 准备提交信息
      // 买家信息
      const buyerTo = {
        buyerMessage: vals.buyerMessage,
        buyerNick: vals.buyerNick,
        receiverAddress: vals.receiverAddress,
        receiverState: selectedState.label,
        receiverCity: selectedCity.label,
        receiverDistrict: selectedDistrict.label,
        receiverName: vals.receiverName,
        receiverMobile: vals.receiverMobile,
      };

      // 商品信息
      const saleOrderDetailToList = toJS(this.productGridModel.rows);
      console.log(saleOrderDetailToList);

      // 结算信息
      const saleOrderFinanceTo = {
        payment: Number(this.totalInfo.payment)?.toFixed(2),
        postFee: Number(this.totalInfo.postFee)?.toFixed(2),
        totalFee: Number(this.totalInfo.totalFee)?.toFixed(2),
      };

      // 翻译省市区
      const selectedSenderState = this.provinceList?.find((item) => item.value === vals.senderState);
      const selectedSenderCity = this.citySenderList?.find((item) => item.value === vals.senderCity);
      const selectedSenderDistrict = this.districtSenderList?.find((item) => item.value === vals.senderDistrict);

      // 发件人信息
      const senderTo = {
        sellerMemo: vals.sellerMemo,
        senderAddress: `${selectedSenderState?.label ? `${selectedSenderState?.label },` : ''}${selectedSenderCity?.label ? `${selectedSenderCity?.label },` : ''}${selectedSenderDistrict?.label ? `${selectedSenderDistrict?.label },` : ''}${vals.senderAddress}`,
        senderName: vals.senderName,
        senderMobile: vals.senderMobile,
      };

      const data = {
        courierId: vals.courierId,
        platformType: vals.platformType,
        shopId: vals.shopId,
        warehouseId: vals.warehouseId,
        buyerTo,
        saleOrderDetailToList,
        saleOrderFinanceTo,
        senderTo,
        totalNum: Number(this.totalInfo.totalNum),
        totalSku: Number(this.totalInfo.totalSku),
      };
      request<BaseData>({
        url: api.createNewOrder,
        method: 'POST',
        data,
      }).then((res) => {
        message.info(res.data);
        this.handleCloseOrderModal();
        this.parent.resetTable();
      })
        .finally(() => {
          this.submitLoading = false;
        });
    })
      .catch((err) => {
        console.log(err);
      });
  };

  // 初始化字典(省）
  @action public initDict = (): Promise<unknown> => {
    // 平台类型
    // const platformTypePromise = request<any[]>({
    //   url: `${api.queryDict}?type=platform_type`,
    //   method: 'GET',
    // }).then((res) => {
    //   this.platTypeList = this.mapOptions(res, 'name', 'code');
    // });

    // 省
    const provincePromise = request<BaseData<any[]>>({
      url: '/api/infrastructure/region/provinces',
      method: 'GET',
    }).then((res) => {
      this.provinceList = this.mapOptions(res?.data || [], 'provinceName', 'id');
    });

    return Promise.all([
      // platformTypePromise,
      provincePromise,
    ]);
  };

  @action public getCityList = (parent_id, initCity?, initDistrict?): void => {
    request({
      url: '/api/infrastructure/region/cities',
      method: 'GET',
      params: { provinceId: parent_id },
    }).then((res: BaseData) => {
      this.cityList = this.mapOptions((res?.data || []), 'cityName', 'id');
      if (initCity) {
        const cityId = this.getIdByName(initCity, this.cityList);
        if (cityId) {
          const { setFieldsValue } = this.orderFormRef.current;
          setFieldsValue({ receiverCity: cityId });
          this.getDistrictList(cityId, initDistrict);
        }
      }
    });
  };

  @action public getSenderCityList = (parent_id): void => {
    request({
      url: '/api/infrastructure/region/cities',
      method: 'GET',
      params: { provinceId: parent_id },
    }).then((res: BaseData) => {
      this.citySenderList = this.mapOptions((res?.data || []), 'cityName', 'id');
    });
  };

  // 地址反解析
  @action public analysisAddress = (): void => {
    console.log('jiexi');
    const address = this.orderFormRef.current?.getFieldValue('receiverAddress');
    if (!address) {
      return;
    }

    // 发送解析请求
    request<BaseData<IAdressResult>>({
      url: '/api/infrastructure/address/parse',
      method: 'POST',
      data: { address },
    }).then((res) => {
      // 不能直接用解析返回的id写
      const { province, city, district, phone, name, detail } = res.data;
      this.reWritePCD(province, city, district);
      const { setFieldsValue } = this.orderFormRef.current;
      setFieldsValue({
        receiverName: name,
        receiverMobile: phone,
        receiverAddress: detail,
      });
    });
  };

  // 地址反解析
  @action public senderAddress = (): void => {
    console.log('firstsender');
    const address = this.orderFormRef.current?.getFieldValue('senderAddress');
    if (!address) {
      return;
    }

    // 发送解析请求
    request<BaseData<IAdressResult>>({
      url: '/api/infrastructure/address/parse',
      method: 'POST',
      data: { address },
    }).then((res) => {
      // 不能直接用解析返回的id写
      const { provinceId, cityId, districtId, phone, name, detail } = res.data;

      this.getSenderCityList(provinceId);
      this.getSenderDistrictList(cityId);
      const { setFieldsValue } = this.orderFormRef.current;
      setFieldsValue({
        senderName: name,
        senderState: provinceId ? Number(provinceId) : undefined,
        senderCity: cityId ? Number(cityId) : undefined,
        senderDistrict: districtId ? Number(districtId) : undefined,
        senderMobile: phone,
        senderAddress: detail,
      });
    });
  };

  @action public reWritePCD = (p, c, d): void => {
    const { setFieldsValue } = this.orderFormRef.current;
    const provinceId = this.getIdByName(p, this.provinceList);
    if (provinceId) {
      setFieldsValue({ receiverState: provinceId });
      this.getCityList(provinceId, c, d);
    }
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

  @action public getDistrictList = (parent_id, initDistrict?): void => {
    request({
      url: '/api/infrastructure/region/districts',
      method: 'GET',
      params: { cityId: parent_id },
    }).then((res: BaseData) => {
      this.districtList = this.mapOptions(res.data || [], 'districtName', 'id');
      if (initDistrict) {
        const districtId = this.getIdByName(initDistrict, this.districtList);
        const { setFieldsValue } = this.orderFormRef.current;
        setFieldsValue({ receiverDistrict: districtId });
      }
    });
  };

  @action public getSenderDistrictList = (parent_id): void => {
    request({
      url: '/api/infrastructure/region/districts',
      method: 'GET',
      params: { cityId: parent_id },
    }).then((res: BaseData) => {
      this.districtSenderList = this.mapOptions(res.data || [], 'districtName', 'id');
    });
  };

  // formItem的值改变触发操作
  @action public formItemOnChange = (type, keyName, val): void => {
    console.log('改变之后的值-- ', val, ' 改变的项目-- ', keyName, ' 类型-- ', type);
    const { setFieldsValue, getFieldValue } = this.orderFormRef.current;
    if (type === 'select') {
      if (keyName === 'shopId') {
        request<BaseData<any>>({
          url: `${api.queryShopInfo}/${val}`,
          method: 'GET',
        }).then((res) => {
          if (res && res.data) {
            const data = res.data;
            setFieldsValue({
              warehouseId: data.defaultWarehouseId ? `${data.defaultWarehouseId }` : undefined,
              courierId: data.defaultCourierId ? `${data.defaultCourierId }` : undefined,
              platformType: data.platformType ? `${data.platformType }` : undefined,
              senderName: data.senderName,
              senderMobile: data.senderTel,
              senderAddress: data.senderCombAddress,
            });
          }
        });
      }

      if (keyName === 'receiverState') {
        setFieldsValue({
          receiverCity: '',
          receiverDistrict: '',
        }); // 清空市区
        this.getCityList(val);
      }

      if (keyName === 'receiverCity') {
        setFieldsValue({ receiverDistrict: '' }); // 清空市区
        this.getDistrictList(val);
      }

      if (keyName === 'senderState') {
        setFieldsValue({
          senderCity: '',
          senderDistrict: '',
        }); // 清空市区
        this.getSenderCityList(val);
      }

      if (keyName === 'senderCity') {
        setFieldsValue({ senderDistrict: '' }); // 清空市区
        this.getSenderDistrictList(val);
      }
    }

    // 改变邮费
    if (type === 'inputNumber') {
      if (keyName === 'postFee') {
        this.totalInfo.postFee = val;
        this.updateTotalInfo();

        // const payment = getFieldValue('payment');
        // const totalFee = Number(payment) + Number(val);
        // setFieldsValue({ totalFee });
      }
    }
  };

  // 处理商品列表
  private dealProductList = (rows: any[]) => {
    return rows?.map((item) => ({
      colorType: item.colorType,
      sizeType: item.sizeType,
      num: item.num || 1,
      pic: item.pic,
      salePrice: item.salePrice || 0,
      price: item.salePrice || 0,
      payment: multiple(item.salePrice, item.num),
      productNo: item.productNo || '',
      skuNo: item.skuNo,
      skuId: item.id,
      spec: item.spec,
    }));
  };

  // 更新结算信息
  private updateTotalInfo = (): void => {
    try {
      const postFee = Number(this.orderFormRef.current.getFieldValue('postFee')) || 0;

      this.totalInfo.totalFee = this.productGridModel.rows.reduce((a, b) => {
        return add(a, b.payment);
      }, 0);
      this.totalInfo.totalSku = this.productGridModel.rows.length;
      this.totalInfo.totalNum = this.productGridModel.rows.reduce((a, b) => (a + b.num), 0);

      // 订单总金额 === 商品总金额 + 邮费
      this.totalInfo.orderFee = add(this.totalInfo.totalFee, postFee);

      // 实付金额 === 订单总金额 - 优惠
      this.totalInfo.payment = subtract(this.totalInfo.orderFee, this.totalInfo.discountFee);
    } catch (e) {
      console.log(`更新结算信息出错:${e}`);
    }
  };

  // 添加商品（增量添加）
  private addProducts = (addedRows): void => {
    const addedIds = addedRows?.map((item) => item.skuId);

    // 找到当前新增的ids
    const currentAddIds = _.difference(addedIds, this.productIds);

    // 找到重复添加的ids
    const alreadyhasIds = _.intersection(addedIds, this.productIds);

    currentAddIds.forEach((item) => {
      const addRow = addedRows.find((row) => row.skuId === item);
      this.productGridModel.rows.push(addRow);
    });
    alreadyhasIds.forEach((item) => {
      const addRowIndex = this.productGridModel.rows.findIndex((row) => row.skuId === item);
      console.log(addRowIndex);

      // 有可能增加多个
      const addItem = addedRows.find((v) => v.skuId === item);
      const addNum = addItem.num;
      const originNum = this.productGridModel.rows[addRowIndex].num;

      this.productGridModel.rows[addRowIndex].num = originNum + addNum;
    });

    this.productIds = this.productGridModel.rows.map((item) => item.skuId);
  };

  private mapOptions = (list, keyField, valField): void => {
    return list.map((item) => ({
      label: item[keyField],
      value: item[valField],
    }));
  };

  // 商品列表直接查询
  @action public queryProductInfo = (): void => {
    const formInfo = this.querySkuRef.current?.getFieldsValue();
    const { key, value } = formInfo;
    const data = { [key]: value };
    request<BaseData<PureData<SkuInfo>>>({
      url: api.querySkuV2,
      method: 'POST',
      data,
    }).then((res) => {
      const addedRows = this.dealProductList(res.data?.list);
      this.addProducts(addedRows);
      this.updateTotalInfo();
    })
      .finally(() => {
        this.querySkuRef.current?.resetFields();
      });
  };

  // 添加选中商品
  @action public addSelectedProduct = (rows): void => {
    const addedRows = this.dealProductList(rows);
    this.addProducts(addedRows);

    // 更新结算信息
    this.updateTotalInfo();
  };

  // 单价或数量改变
  @action public onNumOrUnitChange = (type: string, id: number, val: number): void => {
    const changedIndex = this.productGridModel.rows.findIndex((item) => item.skuId === id);
    const changeItem = this.productGridModel.rows[changedIndex];
    type === 'num' ? changeItem.num = val : changeItem.price = val;
    changeItem.payment = type === 'num' ? multiple(val, changeItem.price) : multiple(val, changeItem.num);

    // 表内数据改变
    this.productGridModel.rows.splice(changedIndex, 1, changeItem);

    // 更新结算信息
    this.updateTotalInfo();
  };

  // 打开添加商品
  @action public openAddProductModal = (): void => {
    this.parent.addProductStore.noAddRequest = true;
    this.parent.addProductStore.openAddProductModal();
  };

  // 清空商品列表
  @action public clearProductInfo = (): void => {
    this.productGridModel.rows = [];
    this.productIds = [];
    this.updateTotalInfo();
  };

  // 删除商品
  @action public deleteProduct = (id): void => {
    const deletedIndex = this.productGridModel.rows.findIndex((item) => item.skuId === id);
    this.productGridModel.rows.splice(deletedIndex, 1);
    this.productIds = this.productGridModel.rows.map((item) => item.skuId);
    this.updateTotalInfo();
  };
}
