import { action, observable } from 'mobx';
import { request } from 'jumai-utils';
import React from 'react';
import type { IParentStore } from '../../store';
import type { InputRef } from 'antd';
import { message } from 'antd';

export default class CryptographicCheckModel {
  constructor(parent: IParentStore) {
    this.parent = parent;
  }

  @observable public open = false;

  @observable public passwordError = false;

  @observable public password: string;

  @observable public loading = false;

  public parent: IParentStore;

  public callback: () => void;

  public inputRef = React.createRef<InputRef>();

  @action

  // public __init__() {

  // }

  @action
  public setPassword = (value: string) => {
    this.password = value;
  };

  @action
  public onOpen = (callback: () => void) => {
    this.open = true;
    this.callback = callback;
  };

  @action
  public onCancel = () => {
    this.open = false;
    this.passwordError = false;
    this.password = undefined;
  };

  @action
  public onOk = async() => {
    try {
      if (!this.password) {
        return;
      }
      this.loading = true;
      await request({
        method: 'POST',
        url: '/api/iac/user/admin/sensitiveOperateCheck',
        data: { password: this.password },
      });
      this.onCancel();
      this.callback && this.callback();
    } catch (e) {
      message.destroy();
      console.error(e);
      if (e?.data?.data === '密码不正确') {
        this.passwordError = true;
        this.inputRef?.current?.focus({ cursor: 'all' });
      } else {
        message.error(e?.data?.data);
      }
    } finally {
      this.loading = false;
    }
  };
}
