import { observable, action } from 'mobx';
import ByShopStore from './byShop/store';
import ByProductStore from './byProduct/store';
import SelectMaterialModal from './components/selectMaterialModal/store';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { mapOptions } from '../../../../utils';

export default class SetServiceStore {
  constructor(params?: {
    onCloseCallback?: () => void;
  }) {
    this.onCloseCallback = params?.onCloseCallback;
    this.getShopList();
    this.getQualifyList();
    this.getWashCardList();
  }

  private onCloseCallback: () => void | undefined;

  public byShopStore = new ByShopStore(this);

  public byProductStore = new ByProductStore(this);

  public selectMaterialModal = new SelectMaterialModal();

  @observable public visible = false;

  @observable public activeTabKey = 'byShop';

  // 店铺列表
  @observable public shopList = [];

  // 合格证列表
  @observable public qualifyList = [];

  // 水洗唛列表
  @observable public washCardList = [];

  // 默认增值服务列表
  public readonly defaultServices = [
    {
      enable: false,
      valueAddedName: '换吊牌',
      valueAddedType: 1,
    },
    {
      enable: false,
      valueAddedName: '换包装',
      valueAddedType: 3,
    },
    {
      enable: false,
      valueAddedName: '放合格证',
      valueAddedType: 4,
    },
    {
      enable: false,
      valueAddedName: '放好评卡',
      valueAddedType: 5,
    },
    {
      enable: false,
      valueAddedName: '放发货单',
      valueAddedType: 6,
    },
    {
      enable: false,
      valueAddedName: '放水洗唛',
      valueAddedType: 8,
    },
    {
      enable: false,
      valueAddedName: '换领标',
      valueAddedType: 9,
    },
  ];

  @action public onTabChange = (activeTab: string) => {
    this.activeTabKey = activeTab;
  };

  @action
  public show = () => {
    this.visible = true;
    this.byShopStore.init();
  };

  @action public onClose = () => {
    this.visible = false;
    this.onCloseCallback?.();
    if (this.activeTabKey === 'byShop') {
      this.byShopStore.reset();
    }
  };

  @action public onOk = () => {
    if (this.activeTabKey === 'byShop') {
      this.byShopStore.handleSetService();
    } else {
      this.onCloseCallback?.();
      this.visible = false;
    }
  };

  // 获取店铺列表
  @action
  public getShopList = async() => {
    const { data } = await request<BaseData<Array<{
      shopId: string;
      shopName: string;
    }>>>({
      url: '/api/baseinfo/rest/shop/query/list',
      method: 'GET',
    });
    this.shopList = data;
    this.byProductStore.searchListModal.programme.filterItems.addDict({
      shopId: data.map((i) => ({
        label: i.shopName,
        value: i.shopId,
      })),
    });
  };

  // 获取合格证列表
  @action
  public getQualifyList = async() => {
    const { data } = await request<BaseData<[]>>({
      url: '/api/print/queryCertTemplateList',
      method: 'POST',
    });
    this.qualifyList = mapOptions(data, 'id', 'name');
  };

  // 获取水洗唛列表
  @action
  public getWashCardList = async() => {
    const { data } = await request<BaseData<[]>>({
      url: '/api/print/queryWashIconTemplateList',
      method: 'POST',
    });
    this.washCardList = mapOptions(data, 'id', 'name');
  };
}
