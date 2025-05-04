import { InputNumber, message } from 'antd';
import { renderModal } from 'jumai-common';
import { EgGridModel, ImgFormatter, request, BatchReport } from 'jumai-utils';
import type { BatchReportData, PaginationData } from 'jumai-utils';
import { action, observable, toJS } from 'mobx';
import qs from 'qs';
import React from 'react';

export default class {
  constructor(parent) {
    this.parent = parent;
    this._init();
  }

  public parent: any;

  @observable public visible = false;

  // 顶部表格/底部表格公用
  public targetColumns = [
    {
      key: 'product_name',
      name: '商品名称',
    },
    {
      key: 'product_no',
      name: '商品编码',
    },
    {
      key: 'sku_no',
      name: 'SKU编码',
    },
    {
      key: 'pic_url',
      name: '图片',
      formatter: ({ row }) => {
        return (<ImgFormatter value={row.pic_url}/>);
      },
    },
    {
      key: 'color_type',
      name: '颜色',
    },
    {
      key: 'size_type',
      name: '尺码',
    },
    {
      key: 'title',
      name: '商品描述',
    },
    {
      key: 'is_donate',
      name: '赠品',
    },
    {
      key: 'is_out_of_stock',
      name: '缺货',
    },
    {
      key: 'sku_cost_price',
      name: '成本价',
    },
    {
      key: 'sale_price',
      name: '销售价',
    },
    {
      key: 'price',
      name: '卖出价',
    },
    {
      key: 'payment',
      name: '实付金额',
    },
    {
      key: 'sku_properties_name',
      name: '网店规格',
    },
    {
      key: 'sku_model',
      name: '规格',
    },

  ];

  // 顶部表格
  public topExtraColumns = [
    {
      key: 'num',
      name: '下单数量',
    },
    {
      key: 'splitNum',
      name: '拆分数量',
      width: 160,
      formatter: ({ row }) => (
        <InputNumber
          max={row.num}
          min={1}
          onBlur={(e) => this.changeSplitNum(row, e.target.value || 1)}
          onStep={(value) => this.changeSplitNum(row, value)}
          parser={(value) => value.replace(/\D/g, '')}
          value={row.splitNum}
        />
      ),
    },
    {
      key: 'netWeight',
      name: '总重量',
    },
    {
      key: 'splitWeight',
      name: '拆分重量',
      formatter: ({ row }) => (
        <span>
          {row.netWeight * row.splitNum / row.num}
        </span>
      ),
    },
  ];

  // 底部表格
  public bottomExtraColumns = [
    {
      key: 'splitNum',
      name: '数量',
    },
    {
      key: 'splitWeight',
      name: '重量',
    },
  ];

  public topGridModel: EgGridModel;

  public bottomGridModel: EgGridModel;

  public orderId: number | string;

  public _init = () => {
    this.topGridModel = new EgGridModel(this.getGridModel(this.targetColumns.concat(this.topExtraColumns)));
    this.bottomGridModel = new EgGridModel(this.getGridModel(this.targetColumns.concat(this.bottomExtraColumns)));
  };

  public getGridModel = (columns) => {
    return {
      columns: columns.map((item) => ({
        ...item,
        resizable: true,
      })),
      rows: [],
      primaryKeyField: 'vsaleorderdetail_id',
      showCheckBox: true,
      showRefresh: false,
      showPagination: false,
      showReset: false,
    };
  };

  // 修改拆分数量
  @action
  public changeSplitNum = (row, value) => {
    this.topGridModel.rows = this.topGridModel.rows.map((item) => {
      if (item.vsaleorderdetail_id === row.vsaleorderdetail_id) {
        return {
          ...item,
          splitNum: value,
          splitWeight: row.netWeight * row.splitNum / row.num,
        };
      }
      return item;
    });
  };

  @action
  public getTopGridRow = async(orderId) => {
    this.orderId = orderId;
    try {
      this.topGridModel.loading = true;
      const req = await request<PaginationData<any>>({
        method: 'GET',
        url: '/api/oms/rest/vdetail/getOrderDetail',
        params: {
          sidx: '',
          sord: 'asc',
          page: 1,
          pageSize: 10000,
          orderID: orderId,
        },
      });
      if ((req.data.list.length === 1 && req.data.list[0].num === 1) || !req.data) {
        return message.error('当订单只有一条明细或者无明细时，不能拆分！');
      }
      this.topGridModel.rows = req.data.list.map((item: any) => ({
        ...item,
        splitNum: item.num,
        splitWeight: item.netWeight,
      }));
      this.visible = true;
    } catch (e) {
      console.error(e);
    } finally {
      this.topGridModel.loading = false;
    }
  };

  @action
  public onCancel = () => {
    this.visible = false;
    this.topGridModel.clearToOriginal();
    this.bottomGridModel.clearToOriginal();
  };

  @action
  public onSplit = (): any => {
    const selectRows = this.topGridModel.selectRows;
    if (!selectRows.length) {
      return message.error('请至少选择一行！');
    }

    // 拆分时，上侧表格保留未勾选和勾选时拆分数量小于总数的明细
    const _topRows = this.topGridModel.rows.filter((row) => {
      if (!selectRows.find((el) => (el.vsaleorderdetail_id === row.vsaleorderdetail_id && Number(el.splitNum) === Number(row.num)))) {
        return row;
      }
    });
    if (!_topRows.length) {
      return message.error('至少保留一条明细,请取消一些勾选！');
    }
    this.topGridModel.rows = _topRows;

    // 拆分时，如下侧表格中有同一条被拆分的数据，则拆分数量覆盖
    this.bottomGridModel.rows.filter((item) => selectRows.find((el) => el.vsaleorderdetail_id === item.vsaleorderdetail_id))
      .forEach((item) => {
        const row = selectRows.filter((el) => el.vsaleorderdetail_id === item.vsaleorderdetail_id)[0];
        item.splitNum = Number(row.splitNum);
        item.splitWeight = Number(row.splitWeight);
      });

    // 拆分时，如下侧表格中无同一条被拆分的数据，则新增拆分条
    this.bottomGridModel.rows = this.bottomGridModel.rows.concat(selectRows.filter((item) => !this.bottomGridModel.rows.find((el) => el.vsaleorderdetail_id === item.vsaleorderdetail_id)));

    // 重置
    this.resetGridAll();
  };

  @action
  public resetGridAll = () => {
    this.topGridModel.resetAll();
    this.bottomGridModel.resetAll();
  };

  @action
  public onRestore = (): any => {
    const selectRows = this.bottomGridModel.selectRows;
    if (!selectRows.length) {
      return message.error('请至少选择一行！');
    }
    const _bottomRows = this.bottomGridModel.rows.filter((row) => !selectRows.find((el) => el.vsaleorderdetail_id === row.vsaleorderdetail_id));

    // 新增不重复明细
    this.topGridModel.rows = this.topGridModel.rows.concat(selectRows.filter((item) => !this.topGridModel.rows.find((el) => el.vsaleorderdetail_id === item.vsaleorderdetail_id)));
    this.bottomGridModel.rows = _bottomRows;
    this.resetGridAll();
  };

  @action
  public onSave = async() => {
    if (!this.bottomGridModel.rows.length) {
      return message.error('未进行拆分操作，无需保存，可直接取消！');
    }

    // 当上侧表格和下侧表格同时存在时一条数据时
    const repeatData = this.topGridModel.rows.filter((item) => this.bottomGridModel.rows.find((el) => el.vsaleorderdetail_id === item.vsaleorderdetail_id))
      .map((item) => {
        const row = this.bottomGridModel.rows.filter((el) => el.vsaleorderdetail_id === item.vsaleorderdetail_id)[0];
        return {
          ...item,
          splitNum: Number(row.num) - Number(row.splitNum),
        };
      });

    // 当上侧表格和下侧表格不同时存在时一条数据时
    const noRepeatData = this.topGridModel.rows.filter((item) => !this.bottomGridModel.rows.find((el) => el.vsaleorderdetail_id === item.vsaleorderdetail_id))
      .map((item) => ({
        ...item,
        splitNum: Number(item.num),
      }));

    const allTopData = repeatData.concat(noRepeatData);

    const req = await request<BatchReportData>({
      method: 'POST',
      url: '/api/saleorder/rest/split/freeSplit',
      data: {
        saleOrderId: this.orderId,
        group1: Array.from(allTopData.map((v) => ({
          saleOrderDetailId: v.vsaleorderdetail_id,
          num: v.splitNum,
        }))),
        group2: Array.from(this.bottomGridModel.rows.map((v) => ({
          saleOrderDetailId: v.vsaleorderdetail_id,
          num: v.splitNum,
        }))),
      },
    });
    this.handleShowMarkDialog(req);
    this.onCancel();
    if (this?.parent?.visible) {
      this.parent.onCancel();
    }
    this?.parent?.resetTable && this.parent.resetTable();
  };

  public handleShowMarkDialog = (data): void => {
    renderModal(
      <BatchReport
        {...data.data}
        columns={[
          {
            title: '订单编号',
            dataIndex: 'saleOrderNo',
          },
          {
            title: '失败原因',
            dataIndex: 'reason',
          },
        ]}
      />
    );
  };
}
