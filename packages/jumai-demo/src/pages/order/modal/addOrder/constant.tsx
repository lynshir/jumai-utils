import { phoneReg } from 'jumai-common';
import type Store from './addOrderStore';

export const baseInfo = (context: Store) => {
  return [
    {
      label: '店铺',
      name: 'shopId',
      type: 'select',
      required: true,
      options: context.parent.shopList || [],
      handleChange: (val): void => {
        context.formItemOnChange('select', 'shopId', val);
      },
    },
    {
      label: '仓库',
      name: 'warehouseId',
      required: true,
      type: 'select',
      options: context.parent.programme.filterItems.dict['warehouse_id-4-13'],
    },
    {
      label: '快递',
      name: 'courierId',
      required: true,
      type: 'select',
      options: context.parent.programme.filterItems.dict['courier_id-4-14'],
    },
    {
      label: '平台类型',
      name: 'platformType',
      required: true,
      type: 'input',
      hidden: true,
    },
  ];
};

export const buyerInfo = (context: Store) => {
  return [
    {
      label: '买家昵称',
      name: 'buyerNick',
      type: 'input',
      required: true,
    },
    {
      label: '收货人姓名',
      name: 'receiverName',
      type: 'input',
      required: true,
    },
    {
      label: '手机',
      name: 'receiverMobile',
      type: 'input',
      placeholder: '不可与固话同时为空',
      checkPattern: {
        pattern: phoneReg,
        message: '请输入正确的手机号！',
      },
    },
    {
      label: '固话',
      name: 'receiverPhone',
      type: 'input',
      placeholder: '不可与手机同时为空',
      checkPattern: {
        pattern: /^\d{3}-\d{7,8}|\d{4}-\d{7,8}$/,
        message: '请输入正确的固话！',
      },
    },
    {
      label: '省',
      name: 'receiverState',
      type: 'select',
      required: true,
      options: context.provinceList,
      handleChange: (val): void => {
        context.formItemOnChange('select', 'receiverState', val);
      },
    },
    {
      label: '市',
      name: 'receiverCity',
      type: 'select',
      required: true,
      options: context.cityList,
      handleChange: (val): void => {
        context.formItemOnChange('select', 'receiverCity', val);
      },
    },
    {
      label: '区',
      name: 'receiverDistrict',
      type: 'select',
      required: true,
      options: context.districtList,
    },
    {
      label: '邮编',
      name: 'receiverPost',
      type: 'input',
    },
  ];
};

export const senderInfo = (context: Store) => {
  return [
    {
      label: '发件人姓名',
      name: 'senderName',
      type: 'input',
    },
    {
      label: '电话',
      name: 'senderMobile',
      type: 'input',
    },
  ];
};

export const totalInfo = (context: Store) => {
  return [
    {
      label: '应收邮费',
      name: 'postFee',
      type: 'input',
      require: false,
      handleChange: (e) => {
        const val = e.target.value;
        context.formItemOnChange('input', 'postFee', val);
      },
    },
    {
      label: '订单总金额',
      name: 'totalFee',
      type: 'input',
      require: false,
      disabled: true,
    },
    {
      label: '实付金额',
      name: 'payment',
      type: 'input',
      require: false,
      disabled: true,
    },
    {
      label: '订单数量',
      name: 'totalNum',
      type: 'input',
      require: false,
      disabled: true,
    },
    {
      label: '付款方式',
      name: 'payType',
      type: 'select',
      require: false,
      options: [
        {
          label: '在线支付',
          value: '0',
        },
        {
          label: '支付宝',
          value: '1',
        },
        {
          label: '微信',
          value: '2',
        },
        {
          label: '货到付款',
          value: '4',
        },
      ],
    },
  ];
};
