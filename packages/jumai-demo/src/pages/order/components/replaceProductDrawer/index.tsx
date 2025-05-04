import React from 'react';
import { Drawer, Space, Button, Alert, Card } from 'antd';
import { observer } from 'mobx-react';
import { MainSubStructure, NormalProgrammeComponent } from 'jumai-utils';
import type Store from './store';
import styles from './index.less';

export default observer((props: { store: Store; }) => {
  const { visible, mainSubStructureModel, normalProgramme, close, onSave, loading, onClickTips } = props.store;
  return (
    <Drawer
      className={styles.drawer}
      footer={(
        <Space>
          <Button onClick={close}>
            取消
          </Button>
          <Button
            loading={loading}
            onClick={onSave}
            type="primary"
          >
            执行替换
          </Button>
        </Space>
      )}
      onClose={close}
      open={visible}
      title="替换商品（按策略）"
      width={800}
    >
      <Alert
        message={(
          <div>
            <div>
              勾选商品点击执行替换后，将根据【
              <a onClick={onClickTips}>
                设置-商品替换策略
              </a>
              】中的策略对待发货订单中的原始商品进行替换。

            </div>
            <div>
              为了保证系统性能，待发订单数统计可能存在差异，以实际订单为准。
            </div>
          </div>
        )}
        showIcon
      />
      <div style={{ margin: '10px 0' }}>
        <NormalProgrammeComponent store={normalProgramme}/>
      </div>
      <div className={styles.tableWrapper}>
        <MainSubStructure store={mainSubStructureModel}/>
      </div>
    </Drawer>
  );
});
