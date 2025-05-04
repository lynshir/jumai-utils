import React from 'react';
import { observer } from 'mobx-react';
import { Modal, Space, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type Store from './store';
import styles from './index.less';

export default observer((props: { store: Store; }) => {
  const { visible, onClickQuestionButton, onClickMyOrderButton, onClickContinueButton } = props.store;
  
  return (
    <Modal
      centered
      closable={false}
      footer={null}
      maskClosable={false}
      open={visible}
      title={null}
    >
      <div className={styles.content}>
        <ExclamationCircleOutlined className={styles.icon}/>
        <div>
          <div className={styles.title}>
            请您在新打开的页面上完成付款
          </div>
          <div className={styles.subTitle}>
            <div>
              付款完成前请不要关闭窗口
            </div>
            <div>
              完成付款后请根据您的情况点击下面的按钮
            </div>
          </div>
        </div>
      </div>
      <Space
        className={styles.buttonWrapper}
      >
        <Button onClick={onClickQuestionButton}>
          付款遇到问题
        </Button>
        <Button onClick={onClickMyOrderButton}>
          查看我的订单
        </Button>
        <Button
          onClick={onClickContinueButton}
          type="primary"
        >
          继续代发
        </Button>
      </Space>
    </Modal>
  );
});

