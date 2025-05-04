import { SettingOutlined } from '@ant-design/icons';
import { Checkbox, Popover, Button } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

export const ProductSetting = observer((props) => {
  const { store } = props;
  return (
    <div>
      <span>
        商品
      </span>
      <Popover
        content={<Setting store={store}/>}
        onVisibleChange={(e) => store.changeVisible(e)}
        open={store.visible}
        overlayClassName={styles.productSettingPopover}
        placement="bottomLeft"
        trigger="click"
      >
        <SettingOutlined
          className={styles.icon}
          onClick={(e) => e.stopPropagation()}
        />
      </Popover>
    </div>
  );
});

const Setting = observer((props) => {
  const { store } = props;
  return (
    <div
      className={styles.container}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox.Group
        onChange={(e) => store.changeCheckType(e)}
        options={store.displayType}
        value={store.checkType}
      />
      <div className={styles.settingBtns}>
        <Button
          onClick={() => store.restoreDefault()}
          size="small"
        >
          恢复默认
        </Button>
        <Button
          className={styles.submitBtn}
          onClick={() => store.submit()}
          size="small"
        >
          确定
        </Button>
      </div>

    </div>
  );
});
