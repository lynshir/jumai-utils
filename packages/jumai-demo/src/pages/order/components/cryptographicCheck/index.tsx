import React, { Component } from 'react';
import { Input, Modal } from 'antd';
import styles from './index.less';
import type CryptographicCheckModel from './model';
import { observer } from 'mobx-react';

@observer
export default class CryptographicCheck extends Component<{ store: CryptographicCheckModel; }> {
  constructor(prop) {
    super(prop);
  }

  public render() {
    const { open, onCancel, onOk, passwordError, password, setPassword, loading, inputRef } = this.props.store;
    return (
      <Modal
        centered
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={onOk}
        open={open}
        title="密码校验"
        width={400}
        zIndex={2001}
      >
        <div className={styles.page}>
          <div>
            管理员开启【已打印订单反审核需要密码校验】参数，请先输入主帐号密码进行验证。
          </div>
          <div className={styles.password}>
            <Input.Password
              allowClear
              className={styles.main}
              onChange={(e) => {
                setPassword(e?.target?.value);
              }}
              onPressEnter={onOk}
              placeholder="请输入主帐号密码"
              ref={inputRef}
              value={password}
              visibilityToggle={false}
            />
            {passwordError ? (
              <span className={styles.passwordError}>
                密码错误，请重新输入
              </span>
            ) : ''}
          </div>
        </div>
      </Modal>
    );
  }
}
