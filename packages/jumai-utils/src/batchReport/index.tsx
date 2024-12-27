import { Button, message, Modal, Table } from 'antd';
import { destroyModal } from 'jumai-common';
import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import type { BatchReportData } from 'jumai-common';
import styles from './index.module.less';

// eslint-disable-next-line @typescript-eslint/ban-types
export const BatchReport: React.FC<BatchReportData<Object>['data'] & {

  /**
   * 列配置
   */
  columns: Array<{ dataIndex: string; title: string; width?: number; align?: string; }>;
}> = function(props) {
  const columns = [
    {
      dataIndex: '_index',
      title: '序号',
      width: 50,
      align: 'center',
    },

    // @ts-ignore
  ].concat(props.columns || []);
  const dataSource = (props.list || props.failedList || []).map((item, index) => ({
    ...item,
    _index: index + 1,
  }));
  const copyText = dataSource.map((current) => columns.map((item) => item.dataIndex)
    .map((item) => current[item] || '')
    .join(','))
    .join('\n');

  function onCopy() {
    message.success('复制成功');
  }

  function onOk() {
    destroyModal();
  }

  return (
    <Modal
      closable={false}
      closeIcon={null}
      footer={(
        <>
          <CopyToClipboard
            onCopy={onCopy}
            text={copyText}
          >
            <Button
              className="ghost-bg-btn"
              ghost
            >
              复制
            </Button>
          </CopyToClipboard>
          <Button
            onClick={onOk}
            type="primary"
          >
            知道了
          </Button>
        </>
      )}
      open
      width={670}
    >
      <div className={styles.header}>
        共处理
        {props.total >>> 0}
        条，成功
        <span>
          {props.successed >>> 0}
        </span>
        条,失败
        <span>
          {props.failed >>> 0}
        </span>
        条!
      </div>
      {
        props.failed ? (
          <Table

            // @ts-ignore
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey="_index"
            scroll={{
              y: 440,
              x: 0,
            }}
            size="small"
            style={{ height: 480 }}
          />
        ) : null
      }
    </Modal>
  );
};

