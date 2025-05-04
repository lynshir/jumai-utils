import { Modal, Form, Button, Radio, Input } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { FlagItem } from '../../../utils';
import type Store from './remarkStore';
import { templates } from './templateList';

const { Item } = Form;
const { Group } = Radio;

@observer
export default class extends Component<{ store?: Store; }> {
  render() {
    const {
      visible,
      closeRemarkModal,
      remarkFormRef,
      submitRemark,
      insertTemplate,
      parent: { flagData },
    } = this.props.store;
    return (
      <Modal
        destroyOnClose
        maskClosable={false}
        okText="保存"
        onCancel={closeRemarkModal}
        onOk={submitRemark}
        open={visible}
        title="上传备注"
        width={720}
      >
        <Form
          initialValues={{ sellerFlag: 0 }}
          ref={remarkFormRef}
        >
          <Item label="模板变量">
            {
              templates.map((item) => {
                return (
                  <Button
                    key={item.value}
                    onClick={insertTemplate.bind(this, item.name)}
                    size="small"
                  >
                    {item.name}
                  </Button>
                );
              })
            }
          </Item>
          <Item name="sellerFlag">
            <Group size="small">
              <Radio value={0}>
                无旗帜
              </Radio>
              {
                Object.values(flagData as Record<string, FlagItem>).map((item) => (
                  <Radio
                    key={item.value}
                    value={item.value}
                  >
                    <i
                      className="icon-flag"
                      style={{
                        color: item.color,
                        fontSize: '20px',
                      }}
                    />
                  </Radio>
                ))
              }
            </Group>
          </Item>
          <Item
            label="备注内容"
            name="notes"
          >
            <Input.TextArea
              allowClear
              autoSize={{
                minRows: 3,
                maxRows: 3,
              }}
              placeholder="请输入备注内容"
            />
          </Item>
        </Form>
      </Modal>
    );
  }
}
