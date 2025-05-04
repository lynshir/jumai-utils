import type { FilterItemOptions } from 'jumai-utils';
import React from 'react';

const SPILT = '-';

const OPERATE_LIKE = SPILT + 1;
const OPERATE_IS = SPILT + 3;
const OPERATE_IN = SPILT + 4;
const ORDER_TABLE = SPILT + 1;
const SKU_TABLE = SPILT + 6;
const NOTES_TABLE = SPILT + 8;
const PMS_DAILY_PURCHASE_DETIAL_TABLE = SPILT + 9;

const DEADLINE_LOGISTICS_TIME = [
  {
    label: '已超时',
    value: 'overtime',
    fixLabel: true,
  },
  {
    label: '2',
    value: '2',
  },
  {
    label: '4',
    value: '4',
  },
  {
    label: '6',
    value: '6',
  },
  {
    label: '8',
    value: '8',
  },
  {
    label: '10',
    value: '10',
  },
  {
    label: '12',
    value: '12',
  },
  {
    label: '24',
    value: '24',
  },
  {
    label: '36',
    value: '36',
  },
  {
    label: '48',
    value: '48',
  },
  {
    label: '72',
    value: '72',
  },
].map((item) => {
  if (item.fixLabel) {
    return item;
  }
  return {
    label: `${item.label}小时内`,
    value: item.value,
  };
});

const markOptions = [
  {
    label: '已合并',
    value: 'combine',
  },
  {
    label: '已拆分',
    value: 'separate',
  },
  {
    label: '未拆分',
    value: 'no_separate',
  },
  {
    label: '缺货',
    value: 'out_of_stock',
  },
  {
    label: '未匹配上快递',
    value: 'no_courier',
  },
  {
    label: '质检',
    value: 'check',
  },
  {
    label: '售后',
    value: 'after_sale',
  },
  {
    label: '财审',
    value: 'finance',
  },
  {
    label: '异常',
    value: 'abnormal',
  },
  {
    label: '挂起',
    value: 'suspend',
  },
  {
    label: '作废',
    value: 'invalidate',
  },
  {
    label: '黑名单',
    value: 'black',
  },
  {
    label: '测试',
    value: 'test',
  },
  {
    label: '外部订单',
    value: 'offline',
  },
  {
    label: '退款',
    value: 'refund',
  },
  {
    label: '直送订单',
    value: 'tmall_delivery',
  },
  {
    label: '优先发货',
    value: 'priority',
  },
  {
    label: '预售',
    value: 'pre_sale',
  },
  {
    label: '时效',
    value: 'cn_service',
  },
  {
    label: '发票',
    value: 'ticket',
  },
  {
    label: '急',
    value: 'urgent',
  },
  {
    label: '京',
    value: 'store_code_2',
  },
  {
    label: '停发',
    value: 'unable_deliver',
  },
];

// type为true为订单处理
export const filterItems = (context, orderType: boolean): FilterItemOptions[] => {
  return [
    {
      type: 'inputAndSelect',
      field: 'origin_platform_order_code-4-20',
      label: '平台单号',
      selectValue: 'origin_platform_order_code-4-20',
      data: [
        {
          value: 'origin_platform_order_code-4-20',
          label: '平台单号',
          isMultipleSearch: true,
        },
        {
          value: 'sale_order_no-14-10',
          label: '订单编号',
          isMultipleSearch: true,
        },
      ],
    },
    {
      type: 'inputAndSelect',
      field: 'buyer_nick-14-12',
      label: '买家昵称',
      selectValue: 'buyer_nick-14-12',
      data: [
        {
          value: 'buyer_nick-14-12',
          label: '买家昵称',
          isMultipleSearch: true,
        },
        {
          value: 'receiver_mobile-4-12',
          label: '手机号',
          isMultipleSearch: true,
        },
        {
          value: 'receiver_name-14-12',
          label: '收货人',
        },
        {
          value: 'receiver_state-22-12',
          label: '收货人省',
          isMultipleSearch: true,
        },
        {
          value: 'receiver_city-14-12',
          label: '收货人市',
        },
        {
          value: 'receiver_district-14-12',
          label: '收货人区',
        },
      ],
    },
    {
      type: 'inputAndSelect',
      field: `sku_no${OPERATE_LIKE}${SKU_TABLE}`,
      label: 'SKU编码',
      selectValue: `sku_no${OPERATE_LIKE}${SKU_TABLE}`,
      data: [
        {
          value: `sku_no${OPERATE_LIKE}${SKU_TABLE}`,
          label: 'SKU编码',
          isMultipleSearch: orderType,

        },
        {
          value: `unique_code${OPERATE_IN}${PMS_DAILY_PURCHASE_DETIAL_TABLE}`,
          label: '唯一码',
          isMultipleSearch: true,
        },
        {
          value: `bar_code${OPERATE_LIKE}${SKU_TABLE}`,
          label: '条形码',
        },
      ],
    },
    {
      type: 'inputAndSelect',
      field: 'num_iid-4-20',
      label: '平台商品ID',
      selectValue: 'num_iid-4-20',
      data: [
        {
          value: 'num_iid-4-20',
          label: '平台商品ID',
          isMultipleSearch: true,
        },
        {
          value: 'title-1-20',
          label: '商品名称',
        },
        {
          value: 'platform_product_outer_no-4-20',
          label: '平台商品编码',
        },
      ],
    },
    {
      type: 'radio',
      field: 'courier_order_no-4-14',
      label: '快递单号',
      data: [
        {
          label: '快递单号非空',
          value: 'SEARCH_FOR_IS_NOT_NULL',
          showInput: true,

        },
        {
          label: '快递单号为空',
          value: 'SEARCH_FOR_IS_NULL',

        },
        {
          label: '全部',
          value: '',
        },
      ],
    },
    {
      type: 'date',
      field: 'date',
      label: '日期类型',
      selectValue: 'sale_order_status.pay_time',
      data: [
        {
          value: 'sale_order.created',
          label: '下单时间',
        },
        {
          value: 'sale_order_status.pay_time',
          label: '付款时间',
        },
        {
          value: 'sale_order.create_time',
          label: '获取时间',
        },
        {
          value: 'sale_order_warehouse.checked_time',
          label: '验货时间',
        },
        {
          value: 'sale_order_status.oms_checked_time',
          label: '审核时间',
        },
        {
          value: 'sale_order_courier.courier_print_time',
          label: '快递单打印时间',
        },
        {
          value: 'sale_order_status.invalid_time',
          label: '作废时间',
        },
        {
          value: 'sale_order_courier.deadline_logistics_time',
          label: '截止发货时间',
        },
        {
          value: 'sale_order_status.platform_logistics_time',
          label: '平台发货时间',
        },
      ],
    },
    {
      type: 'radio',
      field: `is_checked${OPERATE_IS}${ORDER_TABLE}`,
      label: '审核状态',
      data: [
        {
          label: '未审核',
          value: 'false',
        },
        {
          label: '已审核',
          value: 'true',
        },
        {
          label: '全部',
          value: '',
        },
      ],
    },
    {
      type: 'radio',
      field: 'buyer_message-1-12',
      label: '买家留言',
      data: [
        {
          label: '有留言',
          value: 'SEARCH_FOR_IS_NOT_NULL',
          showInput: true,

        },
        {
          label: '无留言',
          value: 'SEARCH_FOR_IS_NULL',

        },
        {
          label: '全部',
          value: '',
        },
      ],
    },
    {
      type: 'radio',
      field: 'seller_memo-1-10',
      label: '客服备注',
      data: [
        {
          label: '备注非空',
          value: 'SEARCH_FOR_IS_NOT_NULL',
          showInput: true,
        },
        {
          label: '备注为空',
          value: 'SEARCH_FOR_IS_NULL',
        },
        {
          label: '全部',
          value: '',
        },
      ],
    },
    {
      treeDefaultExpandAll: true,
      type: 'treeSelect',
      treeCheckable: true,
      field: 'shop_id-4-10',
      label: '店铺',
      showSearch: true,
      treeNodeFilterProp: 'label',
      showCheckedStrategy: 'SHOW_CHILD',
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'vendor_id-4-5',
      label: '供应商',
      showItem: orderType,
    },
    {
      type: 'patternSearch',
      field: 'reason',
      label: '达人名称',
      showItem: orderType,
      selectParamsField: 'author_name-14-10_type',
      inputParamsField: 'author_name-14-10',

      // selectValue: '0',
      data: [
        {
          value: '0',
          label: '包含',
          inputFocus: true,
        },
        {
          value: '1',
          label: '不包含',
          inputFocus: true,
        },
        {
          value: 'SEARCH_FOR_IS_NULL',
          label: '为空',
          inputDisabled: true,
          clearInputValue: true,
        },
        {
          value: 'SEARCH_FOR_IS_NOT_NULL',
          label: '非空',
          inputDisabled: true,
          clearInputValue: true,
        },
      ],
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'warehouse_id-4-13',
      label: '仓库',
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'courier_id-4-14',
      label: '快递公司',
    },
    {
      type: 'radio',
      field: 'system_memo-1-10',
      label: '订单备注',
      data: [
        {
          label: '备注非空',
          value: 'SEARCH_FOR_IS_NOT_NULL',
          showInput: true,
        },
        {
          label: '备注为空',
          value: 'SEARCH_FOR_IS_NULL',
        },
        {
          label: '全部',
          value: '',
        },
      ],
    },
    {
      type: 'select',
      field: 'seller_memo_read-3-10',
      label: '备注状态',
      data: [
        {
          label: '已处理(未审核订单)',
          value: 'true',
        },
        {
          label: '未处理(未审核订单)',
          value: 'false',
        },
      ],
    },
    {
      type: 'select',
      field: 'proxy_send_status-4-10',
      label: '代发状态',
      data: [
        {
          label: '无需代发',
          value: 'SEARCH_FOR_IS_NULL',
        },
        {
          label: '未代发',
          value: '1',
        },
        {
          label: '已代发',
          value: '2',
        },
        {
          label: '取消代发',
          value: '3',
        },
      ],
    },

    {
      type: 'select',
      field: 'buyer_message_read-3-12',
      label: '留言状态',
      data: [
        {
          label: '已处理(未审核订单)',
          value: 'true',
        },
        {
          label: '未处理(未审核订单)',
          value: 'false',
        },
      ],
    },

    {
      type: 'select',
      field: 'courier_print_mark_state-4-14',
      label: '打印状态',
    },
    {
      type: 'select',
      field: 'checked_time-7-13',
      label: '验货状态',
      data: [
        {
          label: '已验货',
          value: 'true',
        },
        {
          label: '未验货',
          value: 'false',
        },
      ],
    },
    {
      type: 'select',
      field: 'is_out_of_stock-3-21',
      label: '库存状态',
      data: [
        {
          label: '有库存',
          value: 'false',
        },
        {
          label: '无库存',
          value: 'true',
        },
      ],
    },
    {
      field: 'total_num-2-10',
      type: 'inputNumberGroup',
      label: '商品数量',
    },
    {
      type: 'inputNumberGroup',
      field: 'total_sku-2-10',
      label: '商品条数',
    },
    {
      type: 'select',
      mode: 'multiple',
      field: `except_mark${OPERATE_IS}${ORDER_TABLE}`,
      label: '包含标记',
      data: markOptions,
    },
    {
      field: 'trade_memo-1-10',
      type: 'select',
      mode: 'multiple',
      label: '标签',
      data: [],
    },

    {
      type: 'select',
      mode: 'multiple',
      field: 'trade_memo_exclude-1-10',
      label: '排除标签',
      data: [],
      showItem: orderType,
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'seller_flags-1-10',
      label: '包含旗帜',
    },
    {
      type: 'select',
      field: 'purchase_order_no-7-21-4',
      label: '生成采购单',
      data: [
        {
          label: '已采购订单',
          value: 'true',
        },
        {
          label: '未采购订单',
          value: 'false',
        },
      ],
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'sku_purchase_state-4-21',
      label: '拿货状态',
    },
    {
      type: 'radio',
      field: 'group_no-4-10',
      label: '组号',
      data: [
        {
          label: '有组号',
          value: 'SEARCH_FOR_IS_NOT_NULL',
          showInput: true,
        },
        {
          label: '无组号',
          value: 'SEARCH_FOR_IS_NULL',
        },
        {
          label: '全部',
          value: '',
        },
      ],
    },
    {
      type: 'radio',
      field: `content${OPERATE_LIKE}${NOTES_TABLE}`,
      label: '便签',
      data: [
        {
          label: '便签非空',
          value: 'SEARCH_FOR_IS_NOT_NULL',
          showInput: true,
        },
        {
          label: '便签为空',
          value: 'SEARCH_FOR_IS_NULL',
        },
        {
          label: '全部',
          value: '',
        },
      ],
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'distribution_state-4-13',
      label: '平台状态',
    },
    {
      type: 'select', // 订单处理不要  订单查询要 位置平台状态下面
      field: `is_invalidated${OPERATE_IS}${ORDER_TABLE}`,
      label: '作废',
      data: [
        {
          label: '已作废',
          value: 'true',
        },
        {
          label: '未作废',
          value: 'false',
        },
      ],
      showItem: !orderType,
    },
    {
      type: 'select',
      field: 'deadline_logistics_time',
      label: '剩余发货时间',
      data: DEADLINE_LOGISTICS_TIME,
      showItem: orderType,
    },
    {
      type: 'select',
      mode: 'multiple',
      field: `pay_type${OPERATE_IN}${ORDER_TABLE}`,
      label: '支付方式',
    },
    {
      type: 'select',
      field: 'trade_from-4-10',
      label: '设备来源',
    },

    {
      type: 'select',
      mode: 'multiple',
      field: 'cn_service-4-17',
      label: '发货时效',
    },
    {
      type: 'input',
      field: 'purchase_order_no-14-21',
      label: '采购单号',
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'purchase_state-4-13',
      label: '采购状态',
    },
    {
      type: 'select',
      field: `is_suspended${OPERATE_IS}${ORDER_TABLE}`,
      label: '挂起',
      data: [
        {
          label: '已挂起',
          value: 'true',
        },
        {
          label: '未挂起',
          value: 'false',
        },
      ],
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'order_type-4-10',
      label: '订单类型',
    },

    // {
    //   type: 'input',
    //   field: `unique_code${ OPERATE_IN }${PMS_DAILY_PURCHASE_DETIAL_TABLE}`,
    //   label: '唯一码',
    // },

    {
      type: 'inputNumberGroup',
      field: 'payment-6-15',
      label: '实付金额',
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'origin_type-4-10',
      label: '订单来源',
    },

    // {
    //   type: 'input',
    //   field: `bar_code${ OPERATE_LIKE }${SKU_TABLE}`,
    //   label: '条形码',
    // },
    {
      type: 'select',
      field: 'is_out_of_stock-4-21',
      label: '明细缺货',
      data: [
        {
          label: '缺货',
          value: '1',
        },
        {
          label: '不缺货',
          value: '0',
        },
      ],
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'tmser_spu_code-4-20',
      label: '明细平台状态',
    },
    {
      type: 'select',
      field: `is_paid${OPERATE_IS}${ORDER_TABLE}`,
      label: '付款',
      data: [
        {
          label: '已付款',
          value: 'true',
        },
        {
          label: '未付款',
          value: 'false',
        },
      ],
      showItem: !orderType,
    },
    {
      type: 'select',
      field: `is_platform_logistics${NOTES_TABLE}${ORDER_TABLE}`,
      label: '平台发货',
      data: [
        {
          label: '已发货',
          value: 'true',
        },
        {
          label: '未发货',
          value: 'false',
        },
      ],
    },
    {
      type: 'select',
      mode: 'multiple',
      field: 'wms_order_state-4-13',
      label: '发货状态',
    },
    {
      type: 'select',
      field: 'is_pre_sale-8-10',
      label: '预售订单',
      data: [
        {
          label: '是',
          value: 'true',
        },
        {
          label: '否',
          value: 'false',
        },
      ],
    },
    {
      type: 'select',
      field: 'need_combined-1-1',
      label: '待合并',
      data: [
        {
          label: '是',
          value: 'true',
        },
      ],
      showItem: orderType,

    },
    {
      type: 'select',
      field: 'seller_memo_or_buyer_message',
      label: '备注留言',
      data: [
        {
          label: '有留言或备注',
          value: 'true',
        },
      ],
      showItem: orderType,
    },
    {
      type: 'select',
      field: 'refund_state-4-22',
      label: '明细退款状态',
      data: [],
      showItem: !orderType,
    },

    // {
    //   type: 'input',
    //   field: 'receiver_address-1-12',
    //   label: '地址',
    // },

    // {
    //   type: 'select',
    //   field: `approve_state${ OPERATE_IN }${OPERATE_LIKE}`,
    //   label: '财审',
    //   data: [
    //     {
    //       label: '已财审',
    //       value: '3',
    //     },
    //     {
    //       label: '未财审',
    //       value: '0,1,2',
    //     },
    //   ],
    // },

    // {
    //   type: 'inputNumberGroup',
    //   field: 'total_fee-6-15',
    //   label: '应付金额',
    // },

    // {
    //   type: 'select',
    //   mode: 'multiple',
    //   field: `blacklist_type${ OPERATE_IN }${ORDER_TABLE}`,
    //   label: '黑名单',
    // },

    // {
    //   type: 'select',
    //   field: 'is_need_invoice-3-16',
    //   label: '需要发票',
    //   data: [
    //     {
    //       label: '是',
    //       value: 'true',
    //     },
    //     {
    //       label: '否',
    //       value: 'false',
    //     },
    //   ],
    // },

    // {
    //   type: 'select',
    //   field: `remain_deliver_time${ OPERATE_IS }${OPERATE_LIKE}`,
    //   label: '预计剩余时间',
    // },

    // {
    //   type: 'select',
    //   field: 'logistics_time_out',
    //   label: '超时',
    //   data: [
    //     {
    //       label: '超时',
    //       value: '1',
    //     },
    //     {
    //       label: '未超时',
    //       value: '0',
    //     },
    //   ],
    // },
    {
      type: 'select',
      field: 'is_test_order-4-10',
      label: '测试订单',
      showItem: orderType,
      data: [
        {
          label: '测试',
          value: '1',
        },
        {
          label: '正常',
          value: '0',
        },
      ],
    },
    {
      type: 'select',
      label: '运营',
      field: 'operatorId',
    },
  ];
};
