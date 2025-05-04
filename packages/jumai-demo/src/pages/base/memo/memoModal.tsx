import { Modal, Input, Form, Button } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './memoStore';

const { Item } = Form;
const { TextArea } = Input;

@observer
export default class MemoModal extends Component<{ store?: Store ; }> {
  render(): ReactNode {
    const { memoVisible, memoRef, closeMemoModal, addMemoInfo } = this.props.store;
    return (
      <Modal
        footer={null}
        maskClosable={false}
        onCancel={closeMemoModal}
        open={memoVisible}
        title="便签"
      >
        <Form ref={memoRef}>
          <Item
            name="memoInfo"
            style={{ marginBottom: '10px' }}
          >
            <TextArea
              disabled
              rows={12}
              style={{ color: '#6D6E78' }}
            />
          </Item>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
          >
            <Item
              name="content"
              style={{ width: '85%' }}
            >
              <Input onPressEnter={addMemoInfo}/>
            </Item>

            <Button
              onClick={addMemoInfo}
              type="primary"
            >
              提交
            </Button>
          </div>
        </Form>
      </Modal>
    );
  }
}
