import React from 'react';
import type Model from './model';
import { Modal, Card } from 'antd';
import { observer } from 'mobx-react';
import styles from './index.less';
import { NormalProgrammeComponent, MainSubStructure } from 'jumai-utils';

@observer
export default class AddressBaseManagement extends React.Component<{ store: Model; }> {
  render() {
    const { getModalProps, parent, addressBaseNormalProgramme, addressBaseMainSubStructureModel, addresseeNormalProgramme, addresseeMainSubStructureModel } = this.props.store;
    return (
      <Modal {...getModalProps}>
        {parent.activeKey === '1' ? (
          <div className={styles.content}>
            <Card bordered={false}>
              <NormalProgrammeComponent store={addressBaseNormalProgramme}/>
            </Card>
            <div className={styles.mainSubStructure}>
              <MainSubStructure store={addressBaseMainSubStructureModel}/>
            </div>
          </div>
        ) : undefined}
        {parent.activeKey === '2' ? (
          <div className={styles.content}>
            <Card bordered={false}>
              <NormalProgrammeComponent store={addresseeNormalProgramme}/>
            </Card>
            <div className={styles.mainSubStructure}>
              <MainSubStructure store={addresseeMainSubStructureModel}/>
            </div>
          </div>
        ) : undefined}
      </Modal>
    );
  }
}
