import { Button } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import Collapse from '../../order/orderDetails/components/collapse/index';
import styles from './index.less';
import type store from './model';

interface Interface {
  store: store;
}

@observer
export default class extends Component<Interface> {
  render() {
    return (
      <Collapse
        ghost
        title="操作日志"
      >
        <div className={styles.page}>
          <EgGrid store={this.props.store.egGridModel}/>
        </div>
      </Collapse>
    );
  }
}
