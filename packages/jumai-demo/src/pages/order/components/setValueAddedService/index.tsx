import React from 'react';
import { Drawer, Button, Space, Tabs } from 'antd';
import { observer } from 'mobx-react';
import type SetServiceStore from './store';
import styles from './index.less';
import ByShop from './byShop';
import ByProduct from './byProduct';
import SelectMaterialModal from './components/selectMaterialModal';

const SetServiceModal: React.FC<{ store: SetServiceStore; }> = observer((props) => {
  const { byShopStore, byProductStore, visible, onOk, onClose, activeTabKey, onTabChange, selectMaterialModal } = props.store;

  return (
    <Drawer
      bodyStyle={{ padding: 0 }}
      className={styles.drawer}
      footer={(
        <Space className={styles.drawerFooter}>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={onOk}
            type="primary"
          >
            确定
          </Button>
        </Space>
      )}
      maskClosable={false}
      onClose={onClose}
      open={visible}
      title="设置增值服务"
      width={1170}
    >
      <Tabs
        activeKey={activeTabKey}
        className={styles.tabs}
        defaultActiveKey="byShop"
        onChange={onTabChange}
      >
        <Tabs.TabPane
          key="byShop"
          tab="按店铺"
        >
          <ByShop store={byShopStore}/>
        </Tabs.TabPane>
        <Tabs.TabPane
          key="byShopProduct"
          tab="按店铺商品"
        >
          <ByProduct store={byProductStore}/>
        </Tabs.TabPane>
      </Tabs>
      <SelectMaterialModal store={selectMaterialModal}/>
    </Drawer>
  );
});

export default SetServiceModal;
