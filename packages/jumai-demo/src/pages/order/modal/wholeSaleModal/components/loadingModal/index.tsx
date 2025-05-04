import React from 'react';
import { Modal } from 'antd';
import styles from './index.less';
import { getStaticResourceUrl } from 'jumai-common';

export const LoadingModal: React.FC<{ visible: boolean; }> = (props) => {
  const { visible } = props;
  return (
    <Modal
      centered
      className={styles.loadingModal}
      closable={false}
      footer={null}
      forceRender
      maskClosable={false}
      open={visible}
      width={120}
    >
      <div className={styles.loadingContainer}>
        <img
          alt=""
          className={styles.picture}
          src={getStaticResourceUrl('pc/ts/jumai-ts-oms/images/loadingImg.gif')}
          width={120}
        />
      </div>
    </Modal>
  );
};
