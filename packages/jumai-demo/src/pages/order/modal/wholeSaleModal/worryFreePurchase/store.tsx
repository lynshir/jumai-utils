import { action, computed, observable, toJS } from 'mobx';
import { getPrice } from '../../../../../utils';
import type { GoodsVos } from './interface';

interface IWorryFree {
  parent: unknown;
  frontOrBack: 'front' | 'back';
  confirmCallBack?: (goodsList: GoodsVos[], totalAmount?: number) => void;
}
export class WorryFreePurchaseStore {
  constructor({ parent, frontOrBack, confirmCallBack }: IWorryFree) {
    this.parent = parent;
    this.frontOrBack = frontOrBack;
    this.confirmCallBack = confirmCallBack;
  }

  @observable public parent;

  @observable public frontOrBack; // 前台、后台

  @observable public visible = false;

  @observable public worryFreeGoodsList: GoodsVos[] = [];

  @observable public allGoodsList: number[] = []; // 所有的skuid

  @observable public selectedGoodsList: number[] = []; // 选中的sku

  @computed public get checkedAll() {
    const allLength = this.allGoodsList?.length || 0;
    const selectedLength = this.selectedGoodsList?.length || 0;
    if (selectedLength <= 0) {
      return 'none';
    } else if (selectedLength > 0 && selectedLength < allLength) {
      return 'indeterminate';
    } else {
      return 'all';
    }
  }

  // 选中的无忧退货数量和价格
  @computed public get worryFreeGoodsTotal() {
    return this.worryFreeGoodsList?.reduce((pre, cur) => {
      if (this.selectedGoodsList.includes(cur.goodsId)) {
        return {
          totalNum: pre.totalNum + cur.goodsNum,
          totalAmount: this.formatPrice(Number(pre.totalAmount) + (cur.goodsNum * Number(cur.worryFreeCost))),
        };
      }
      return pre;
    }, {
      totalNum: 0,
      totalAmount: 0,
    });
  }

  // 格式化价格,向上取整小数
  private formatPrice = (price: number) => {
    const target = Number(price);
    return (Math.round(target * 100) / 100).toFixed(2);
  };

  private confirmCallBack: (goodsList: GoodsVos[], totalAmount?: number) => void; // 点击确认的回调

  @action public onClose = (): void => {
    this.visible = false;
    this.selectedGoodsList = [];
    this.allGoodsList = [];
    this.worryFreeGoodsList = [];
  };

  @action public onShow = (worryFreeGoodsList: GoodsVos[], selectedGoodsList: GoodsVos[]): void => {
    this.visible = true;
    this.worryFreeGoodsList = worryFreeGoodsList;
    this.allGoodsList = worryFreeGoodsList?.map((el) => el.goodsId);
    this.selectedGoodsList = selectedGoodsList?.map((el) => el.goodsId);
    this.worryFreeGoodsList = worryFreeGoodsList?.map((el) => {
      const price = getPrice(el.price, el.skuDiscountPrice, el.skuActivityPrice) * (el.protectRate || 0.1); // 计算无忧退货费率
      const goods = selectedGoodsList.find((v) => v.goodsId === el.goodsId);
      return {
        ...el,
        goodsNum: goods?.goodsNum || el.goodsNum,
        worryFreeCost: this.formatPrice(price),
      };
    });
  };

  @action public onInputNumberChange = (value: number, type: 'minus' | 'plus' | 'change', id: number | string) => {
    this.worryFreeGoodsList?.forEach((el) => {
      if (el.goodsId === id) {
        switch (type) {
          case 'minus':
            el.goodsNum--;
            break;
          case 'plus':
            el.goodsNum++;
            break;
          case 'change':
            el.goodsNum = value;
            break;
        }
      }
    });
  };

  // 选中单个sku
  @action public onCheckSku = (skuId: number): void => {
    if (this.selectedGoodsList.includes(skuId)) {
      this.selectedGoodsList = this.selectedGoodsList.filter((el) => el !== skuId);
    } else {
      this.selectedGoodsList.push(skuId);
    }
  };

  // 点击全选
  @action public onClickCheckAll = (): void => {
    const allLength = this.allGoodsList?.length || 0;
    const selectedLength = this.selectedGoodsList?.length || 0;
    if (selectedLength < allLength) {
      this.selectedGoodsList = this.allGoodsList;
    } else if (selectedLength === allLength) {
      this.selectedGoodsList = [];
    }
  };

  // 点击确认
  @action public onConfirm = (): void => {
    const selectedList = this.worryFreeGoodsList?.filter((el) => this.selectedGoodsList.includes(el.goodsId));
    console.log(toJS(selectedList));

    if (this.confirmCallBack) {
      this.confirmCallBack(selectedList, Number(this.worryFreeGoodsTotal.totalAmount));
    }
    this.onClose();
  };
}
