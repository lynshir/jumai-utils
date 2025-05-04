import { message } from 'antd';
import type { PaginationData } from 'jumai-utils';
import { EgGridModel, request } from 'jumai-utils';
import { action, observable } from 'mobx';
import moment from 'moment';

export class ManualDownloadOrderModel {
  constructor(parent) {
    this.parent = parent;
  }

  @observable public parent;

  @observable public visible = false; // 弹窗显隐

  @observable public egGridModel: EgGridModel;

  @observable public activeKey = 'dateRange'; // 初始激活key为时间段

  @observable public searchValue = ''; // 搜索框值

  @observable public storeList = []; // 店铺

  @observable public startDate = moment().subtract(3, 'days'); // 按时间段开始时间

  @observable public endDate = moment(); // 按时间段结束时间

  @observable public pageSize = 50; // 分页条数

  @observable public storeRadio = ''; // 按平台单号选中店铺

  @observable public platformNos = ''; // 按平台单号输入区

  @observable public loading = false; // 下载按钮loading

  // 初始化
  @action
  public init = () => {
    this.egGridModel = new EgGridModel({
      columns: [
        {
          key: 'shop_name',
          name: '店铺',
        },
        {
          key: 'platform_type',
          name: '平台类型',
        },
      ].map((item) => ({
        resizable: true,
        sortable: true,
        ...item,
      })),
      rows: [],
      primaryKeyField: 'shop_id',
      showRefresh: false,
      api: {
        onQuery: this.getShop,
        onPageChange: this.changePage,
        onShowSizeChange: this.changePage,
      },
    });
  };

  // 改变显隐
  @action
  public changeVisible = (visible) => {
    this.visible = visible;
    if (!visible) {
      this.reset();

      // 回到初始key
      this.activeKey = 'dateRange';
    } else {
      this.egGridModel.onQuery();

      // 初始化结束时间为当前时间
      this.endDate = moment();

      // 初始化开始时间为结束时间倒退三天
      this.startDate = moment(this.endDate).subtract(3, 'days');
    }
  };

  // 获取店铺
  @action
  public getShop = async(params) => {
    this.egGridModel.loading = true;
    try {
      const { pageSize, page } = params;
      this.pageSize = pageSize;
      const vo = JSON.stringify({
        'is_enabled-4-1': '1',
        auth_status: '已授权',
        'shop_name-1-1': this.searchValue,
      });
      const paramsData = `vo=${vo}&page=${page}&pageSize=${pageSize}`;
      const req = await request<PaginationData>({
        url: '/api/baseinfo/rest/shop/querybyctgrV2',
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        data: paramsData,
      });

      this.egGridModel.rows = req.data.list;
      this.storeList = req.data.list;
      this.egGridModel.total = req.data.totalCount;
    } finally {
      this.egGridModel.loading = false;
    }
  };

  // 切换分页
  @action
  public changePage = (page, pageSize) => {
    this.getShop({
      page,
      pageSize,
    });
  };

  // 搜索店铺
  @action
  public searchShop = (value, e) => {
    // 搜索时，保存当前值
    this.searchValue = value;

    // 请求店铺
    this.getShop({
      page: 1,
      pageSize: this.pageSize,
    });

    // 搜索后，跳转为第一页
    this.egGridModel.current = 1;
  };

  // 切换tab
  @action
  public changeTab = (key) => {
    // 切换key
    this.activeKey = key;

    // 重置
    this.reset();
    if (key === 'dateRange') {
      this.getShop({
        page: 1,
        pageSize: 50,
      });
    } else {
      this.getShop({
        page: 1,
        pageSize: 10000,
      });
    }
  };

  // 重置数据
  @action
  public reset = () => {
    // 切换tab清空搜索框
    this.searchValue = '';

    // 表格回到1页 50条状态 重置选择
    this.egGridModel.current = 1;
    this.egGridModel.pageSize = 50;
    this.egGridModel.resetAll();

    //  开始时间/结束时间回到最初状态
    this.endDate = moment();
    this.startDate = moment(this.endDate).subtract(3, 'days');

    // 按平台单号下载店铺选择第一个

    this.storeRadio = (this?.storeList[0]?.shop_id || undefined);

    // 清空按平台单号下载单号
    this.platformNos = '';
  };

  // 开始下载
  @action
  public startDownload = async() => {
    if (this.activeKey === 'dateRange' && !this.egGridModel.selectRows.length) {
      return message.warning('请选择一项数据');
    }

    if (this.activeKey !== 'dateRange' && !this.platformNos.length) {
      return message.warning('请输入平台单号');
    }

    if (this.activeKey !== 'dateRange' && this.platformNos.split(/\n/).length > 500) {
      return message.warning('平台单号不能超过500条');
    }

    if (this.activeKey === 'dateRange' && moment(this.startDate) > moment(this.endDate)) {
      return message.warning('开始时间不能大于结束时间');
    }

    if (this.activeKey === 'dateRange' && moment(this.startDate).add(30, 'days') < moment(this.endDate)) {
      return message.warning('时间间隔不能超过30天');
    }
    this.loading = true;
    try {
      const req = await request({
        url: '/api/saleorder/rest/order/manual/sync',
        method: 'post',
        data: {
          tid: this.activeKey === 'dateRange' ? undefined : this.platformNos.split(/\n/)
            .map((i) => i?.trim())
            .filter((i) => i)
            .join(','),
          shopId: this.activeKey === 'dateRange' ? Array.from(this.egGridModel.selectedIds).join(',') : this.storeRadio,
          startTime: this.activeKey === 'dateRange' ? moment(this.startDate)
            .valueOf() : undefined,
          endTime: this.activeKey === 'dateRange' ? moment(this.endDate)
            .valueOf() : undefined,
        },
      });
      message.success('下载成功');
      this.loading = false;
      this.changeVisible(false);
    } catch (error) {
      this.loading = false;
    }
  };
}
