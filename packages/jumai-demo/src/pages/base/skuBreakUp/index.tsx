import { Modal, Button, Space } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';
import type store from './model';

interface Interface {
  store: store;
}

@observer
export default class extends React.Component<Interface> {
  constructor(prop) {
    super(prop);
  }

  render() {
    const { onSave, onRestore, onSplit, onCancel, topGridModel, bottomGridModel, visible } = this.props.store;
    return (
      <Modal
        centered
        maskClosable={false}
        okText="确认拆分"
        onCancel={onCancel}
        onOk={onSave}
        title="自由拆分"
        visible={visible}
        width={1300}
      >
        <div className={styles.page}>
          <EgGrid store={topGridModel}/>
          <Space className={styles.space}>
            <Button onClick={onSplit}>
              <i className={`${styles.buttonColor} icon-order_desc`}/>
              拆分
            </Button>
            <Button onClick={onRestore}>
              <i className={`${styles.buttonColor} icon-order_asc`}/>
              还原
            </Button>
          </Space>
          <EgGrid store={bottomGridModel}/>
        </div>
      </Modal>
    );
  }
}
