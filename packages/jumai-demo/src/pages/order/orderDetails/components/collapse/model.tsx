
import { observable, action } from 'mobx';
import { nanoid } from 'nanoid';

export default class {
  constructor() {
    this.id = Number(nanoid());
    this.activeKey = [this.id];
  }

  @observable public id: number;

  @observable public activeKey: number[];

  @action
  public onChange = (e) => {
    this.activeKey = e;
  };
}
