import { WarningFilled } from '@ant-design/icons';
import { Modal, Button } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styles from './index.less';
import type Store from './resultStore';

@observer
export default class ResultModal extends Component<{ store?: Store ; }> {
  private Operation(): ReactNode {
    const { closeResultModal, onCopy, resultText, uncheckFlag, goOnUncheck } = this.props.store;
    return (
      <div className={styles.operationWrapper}>
        {uncheckFlag && (
          <Button onClick={goOnUncheck}>
            继续反审核
          </Button>
        )}
        <CopyToClipboard
          onCopy={onCopy}
          text={resultText}
        >
          <Button>
            复制
          </Button>
        </CopyToClipboard>
        <Button
          onClick={closeResultModal}
          type="primary"
        >
          确定
        </Button>
      </div>
    );
  }

  render(): ReactNode {
    const { resultVisible, closeResultModal, resData, failedGrid } = this.props.store;
    return (
      <Modal
        closeIcon={false}
        footer={this.Operation()}
        maskClosable={false}
        onCancel={closeResultModal}
        open={resultVisible}
        width={600}
        zIndex={2000}
      >
        <div className={`${styles.resultHeader} ${styles.mb10}`}>
          <WarningFilled style={{
            fontSize: '50px',
            color: 'orange',
          }}
          />
          <div>
            <span className={styles.message}>
              {resData.operationName}
            </span>
            <span className={styles.message}>
              {resData.total}
            </span>
            条，成功
            <span
              className={styles.message}
              style={{ color: 'green' }}
            >
              {resData.successed}
            </span>
            条，失败
            <span
              className={styles.message}
              style={{ color: 'red' }}
            >
              {resData.failed}
            </span>
            条！
          </div>
        </div>
        <div className={styles.suspendGridWrapper}>
          <EgGrid store={failedGrid}/>
        </div>
      </Modal>
    );
  }
}
