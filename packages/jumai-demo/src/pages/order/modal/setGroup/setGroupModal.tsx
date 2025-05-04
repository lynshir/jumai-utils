import { Modal, Button } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './setGroupStore';
import styles from './styles.less';

@observer
export default class SetGroup extends Component<{ store: Store ; }> {
  render(): ReactNode {
    const { setGroupVisible, loading, groupGridModel, closeGroupModal, confirm } = this.props.store;
    return (
      <Modal
        footer={null}
        okText="合并分组"
        onCancel={closeGroupModal}
        open={setGroupVisible}
        title="设置分组"
        width={600}
      >
        <div className={styles.mb4}>
          说明：以下为所有未关闭采购单的分组订单数统计
        </div>
        <div style={{ height: '300px' }}>
          <EgGrid store={groupGridModel}/>
        </div>
        <div className={styles.footer}>
          <Button
            disabled={groupGridModel.selectRows.length < 1}
            key="submit"
            loading={loading}
            onClick={confirm}
            type="primary"
          >
            合并分组
          </Button>
          <Button
            key="back"
            onClick={closeGroupModal}
          >
            取消
          </Button>
        </div>
      </Modal>
    );
  }
}
