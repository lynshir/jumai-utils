import type { BaseData } from 'jumai-utils';
import { EgGridModel, request } from 'jumai-utils';
import { action, observable } from 'mobx';
import ProductDetailStore from '../../../../base/productDetail/productDetailStore';
import type parentModel from '../../model';

export default class {
  constructor(parent: parentModel) {
    this.parent = parent;
    this._init();
  }

  public parent: parentModel;

  public _init = () => {
    this.productDetailStore = new ProductDetailStore({ parent: this.parent.parent });
  };

  @observable public productDetailStore: ProductDetailStore;

  public getCommodityData = () => {
    this.productDetailStore.initProductInfo(String(this.parent.orderId), this.parent.currentRow);
  };
}
