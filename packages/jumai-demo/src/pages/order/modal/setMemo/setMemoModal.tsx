import { Modal, Button, Radio, Checkbox, Row, Col, Form, Popover, Input } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import styles from './index.less';
import type Store from './setMemoStore';

const { Item } = Form;

@observer
export default class SetMemo extends Component<{ store: Store ; }> {
  render(): ReactNode {
    const { setMemoVisible, closeMemoModal, showRadio, operateFlag, onOperationChange, showLabel, saveDisabled, updateOrderLabels } = this.props.store;
    return (
      <Modal
        okButtonProps={{ disabled: saveDisabled }}
        okText="保存"
        onCancel={closeMemoModal}
        onOk={updateOrderLabels}
        open={setMemoVisible}
        title="设置标签"
        width={650}
        wrapClassName={styles.modalWrapper}
      >
        {
          showRadio && (
            <Radio.Group
              className={styles.radioWrapper}
              onChange={onOperationChange}
              value={operateFlag}
            >
              <Radio value="0">
                添加标签
              </Radio>
              <Radio value="1">
                覆盖标签
              </Radio>
              <Radio value="2">
                清空标签
              </Radio>
            </Radio.Group>
          )
        }

        {
          showLabel && (
            <LabelList store={this.props.store}/>
          )
        }
      </Modal>
    );
  }
}

@observer
class LabelList extends Component<{ store?: Store ; }> {
  componentDidMount() {
    this.props.store.initLabelList();
  }

  render(): ReactNode {
    const { labelList, labelRef, deleteLabel, addLabelVisible, labelName, handleLabelChange, handlePopoverVisibleChange, closeLabelPopover, dealLabel, openAddLabelPop, openEditLabelPop,
      systemLabelList, manualLabelList } = this.props.store;
    return (
      <>
        <div className={styles.addLabelBtnWrapper}>
          <Popover
            content={addLabelContent(labelName, handleLabelChange, closeLabelPopover, dealLabel)}
            onOpenChange={handlePopoverVisibleChange}
            open={addLabelVisible}
            placement="bottom"
            trigger="click"
          >
            <Button
              icon={<PlusOutlined/>}
              onClick={openAddLabelPop}
              size="small"
              type="dashed"
            >
              新增标签
            </Button>
          </Popover>
        </div>
        
        <Form
          className={styles.memoBackground}
          ref={labelRef}
        >
          <Item name="newLabels">
            <Checkbox.Group>
              <Row>
                {
                  systemLabelList.map((item) => {
                    return (
                      <Col
                        key={item.key}
                        span={8}
                      >
                        <Checkbox
                          className={styles.mb30}
                          value={item.value}
                        >
                          <span className={styles.memoText}>
                            {item.value}
                          </span>
                        </Checkbox>
                        <span className={styles.systemLabel}>
                          系统
                        </span>
                      </Col>
                    );
                  })
                }
              </Row>
              <Row className={styles.manualLabelWrapper}>
                {
                  manualLabelList.map((item) => {
                    return (
                      <Col
                        key={item.key}
                        span={8}
                      >
                        <Checkbox
                          className={styles.mb30}
                          value={item.value}
                        >
                          <span className={styles.memoText}>
                            {item.value}
                          </span>
                        </Checkbox>
                        <Popover
                          content={addLabelContent(labelName, handleLabelChange, closeLabelPopover, dealLabel)}
                          onOpenChange={handlePopoverVisibleChange}
                          open={item.showEdit}
                          placement="bottom"
                          trigger="click"
                        >
                          <i
                            className={`icon-edit ${styles.icon}`}
                            onClick={openEditLabelPop.bind(this, item.key, item.value)}
                            style={{ marginRight: '16px' }}
                          />
                        </Popover>
                        <i
                          className={`icon-delete ${styles.icon}`}
                          onClick={deleteLabel.bind(this, item.key)}
                        />
                      </Col>
                    );
                  })
                }
              </Row>
            </Checkbox.Group>
          </Item>
        </Form>
      </>
    );
  }
}

const addLabelContent = (labelName, handleLabelChange, closeLabelPopover, dealLabel): ReactNode => {
  return (
    <div className={styles.addLabelWrapper}>
      <Input
        onChange={handleLabelChange}
        value={labelName}
      />
      <Button
        ghost
        onClick={dealLabel}
        type="primary"
      >
        确定
      </Button>
      <Button onClick={closeLabelPopover}>
        取消
      </Button>
    </div>
  );
};
