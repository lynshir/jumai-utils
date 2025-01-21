import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Switch, Table } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import type { ReactNode } from 'react';
import React, { Component } from 'react';
import type { ExportStore } from './exportStore';
import styles from './index.module.less';

// 导出弹窗
@observer
export class ExportModal extends Component<{ store?: ExportStore; }> {
  render(): ReactNode {
    const {
      open,
      commitLoading,
      templateList,
      column,
      showMergeFlag,
      mergeFlag,
      fileName,
      showTips,
      templateColumnList,
      editId,
      selectTemplateId,
      setForm,
      onSelectTemplate,
      onChangeFileName,
      onExport,
      onClose,
      newTemplateClick,
      onChangeMergeFlag,
      isAllowAddTemplate,
    } = this.props.store;
    const EditableCell = ({
      editing,
      dataIndex,
      title,
      record,
      index,
      children,
      inputType,
      ...restProps
    }) => {
      const inputNode = inputType === 'input' ? (
        <Input
          autoFocus
          maxLength={10}
        />
      ) : (
        <Select
          allowClear
          className={styles.templateColumnSelect}
          mode="multiple"
          optionFilterProp="label"
          options={templateColumnList.map((el) => ({
            value: el.id,
            label: el.baseSerializeSchemaName,
          }))}
          showSearch
        />
      );
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item
              name={inputType === 'input' ? 'templateName' : 'fieldIds'}
              style={{ margin: 0 }}
            >
              {inputNode}
            </Form.Item>
          ) : (
            children
          )}
        </td>
      );
    };

    const mergedColumns = toJS(column)
      .map((col, index) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record) => ({
            record,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: record.id === editId,
            inputType: col.key === 'templateName' ? 'input' : 'multiSelect',
          }),
        };
      });

    return (
      <Modal
        className={styles.exportModal}
        confirmLoading={commitLoading}
        maskClosable={false}
        onCancel={onClose}
        onOk={onExport}
        open={open}
        title="导出"
        width={884}
      >
        {showMergeFlag && (
          <div className={styles.mergeFlagWrapper}>
            合并单元格：
            <Switch
              checked={mergeFlag}
              onChange={onChangeMergeFlag}
            />
          </div>
        )}
        <div className={styles.fileNameWrapper}>
          文件名称：
          <Input
            className={styles.fileNameInput}
            onChange={onChangeFileName}
            value={fileName}
          />
          <div className={styles.redTips}>
            {showTips ? '文件名称不能包含特殊符号?、:*\\/“”<>|' : ''}
          </div>
        </div>
        <div>
          选择模板：
          <Form
            component={false}
            ref={setForm}
          >
            <Table
              className={styles.table}
              columns={mergedColumns}
              components={{ body: { cell: EditableCell }}}
              dataSource={toJS(templateList)}
              onRow={(record) => {
                return { onClick: () => onSelectTemplate(record.id) };
              }}
              pagination={false}
              rowKey={(record) => record.id}
              rowSelection={{
                selectedRowKeys: [selectTemplateId],
                hideSelectAll: true,
                type: 'radio',
                onSelect: (record) => onSelectTemplate(record.id),
              }}
              scroll={{ y: 400 }}
            />
          </Form>
          {isAllowAddTemplate && (
            <Button
              className={styles.newBtn}
              icon={<PlusOutlined/>}
              onClick={newTemplateClick}
              type="dashed"
            >
              新增模板
            </Button>
          )}
        </div>
      </Modal>
    );
  }
}

