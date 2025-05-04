import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';
import type model from './model';

@observer
export default class ForcedMergers extends React.Component<{ store: model; }> {
  render() {
    const {
      getModalParams,
      getEgGridModel,
    } = this.props?.store;
    return (
      <Modal {...getModalParams}>
        <div className={styles.body}>
          <span className={styles.warring}>
            <ExclamationCircleOutlined className={styles.icon}/>
            <span>
              根据平台规则，如果订单收件人信息不一致强制合并可能会导致平台发货失败，请谨慎操作
            </span>
          </span>
          <EgGrid store={getEgGridModel}/>
        </div>
      </Modal>
    );
  }
}

