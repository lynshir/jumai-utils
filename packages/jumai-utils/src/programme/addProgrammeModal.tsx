import { Form, Modal, Input } from 'antd';
import React from 'react';

interface AddProgrammeModalProps {
  callback: (params: { schemeName: string; }) => Promise<unknown>;
  onCancel: (...args: any[]) => any;
}

export function AddProgrammeModal({
  callback,
  onCancel,
}: AddProgrammeModalProps) {
  const [form] = Form.useForm();
  const [
    data,
    setData,
  ] = React.useState({
    loading: false,
    params: null,
  });
  const handleFinish = React.useCallback((params) => {
    setData({
      loading: true,
      params,
    });
  }, []);

  React.useEffect(() => {
    if (data.params) {
      callback(data.params)
        .catch(() => setData({
          loading: false,
          params: null,
        }));
    }
  }, [
    callback,
    data,
  ]);

  return (
    <Modal
      centered
      maskClosable={false}
      okButtonProps={{ loading: data.loading }}
      onCancel={() => onCancel()}
      onOk={() => form.submit()}
      open
      title="新增方案"
      width={400}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        layout="horizontal"
        onFinish={handleFinish}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label="方案名称"
          name="schemeName"
          rules={[
            {
              required: true,
              message: '方案名称为空',
            },
            {
              max: 15,
              message: '长度超出',
            },
          ]}
        >
          <Input
            autoFocus
            placeholder="请输入方案名称"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
