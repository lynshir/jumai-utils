import type { FormInstance } from 'antd';
import { observable, action, extendObservable, computed } from 'mobx';
import React from 'react';
import SetMemoStore from '../../../modal/setMemo/setMemoStore';
import type parentModel from '../../model';

export default class {
  constructor(parent: parentModel) {
    this.parent = parent;
    this._init();
  }

  @action
  public _init = () => {
    this.setMemoStore = new SetMemoStore({ parent: this });
  };

  public setMemoStore: SetMemoStore;

  public parent: parentModel;

  public formRef = React.createRef<FormInstance>();

  public serFormValues = (obj) => {
    this.formRef.current.setFieldsValue(obj);
  };

  @action
  public onSetMemoClick = async() => {
    this.setMemoStore.showRadio = false;
    this.setMemoStore.operateFlag = '0';
    await this.setMemoStore.initLabelList();
    this.setMemoStore.openMemoModal();
  };
}
