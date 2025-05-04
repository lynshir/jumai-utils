import { UploadOutlined } from '@ant-design/icons';
import { Modal, Form, Button, Upload } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './importAddStore';

@observer
export default class ImportAddModal extends Component<{ store?: Store ; }> {
  render(): ReactNode {
    const { showImporModal, formRef, openImportModal, closeImportModal, loading, handleDownload, handleImport } = this.props.store;
    return (
      <Modal
        footer={(
          <Button
            onClick={closeImportModal}
            type="primary"
          >
            关闭
          </Button>
        )}
        maskClosable={false}
        onCancel={closeImportModal}
        open={showImporModal}
        title="导入"
        width={580}
      >
        <Form
          labelCol={{ span: 6 }}
          ref={formRef}
          wrapperCol={{ span: 18 }}
        >

          <Form.Item
            label="第一步"
            name="template"
          >
            <Button

              // className={styles.importBtns}
              onClick={handleDownload}
            >
              下载模板
            </Button>
          </Form.Item>
          <Form.Item
            getValueFromEvent={(e) => {
              if (e && Array.isArray(e.fileList) && e.fileList.length) {
                return [e.fileList[e.fileList.length - 1]];
              }
              return null;
            }}
            label="第二步"
            name="file"
            rules={[
              {
                required: true,
                message: '请选择文件',
              },
            ]}
            valuePropName="fileList"
          >
            {/* <input
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className={styles.inputFile}
              id="fileNameInput"
              name="file"
              type="file"
            /> */}
            <Upload
              accept=".xlsx"
              beforeUpload={() => false}
            >
              <Button
                icon={<UploadOutlined/>}
              >
                选择文件
              </Button>

            </Upload>
          </Form.Item>

          <Form.Item
            label="第三步"
            name="import"
          >
            <Button

              // className={styles.importBtns}
              // icon={<i className={`icon-import ${styles.importIcon}`}/>}
              loading={loading}
              onClick={handleImport}
            >
              导入
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
