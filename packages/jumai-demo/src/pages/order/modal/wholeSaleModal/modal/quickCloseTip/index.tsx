import React from 'react';
import { Modal } from 'antd';

interface QuickCloseTipModalProps{
  visible: boolean;
  handleClose: () => void;
}

export const QuickCloseTipModal: React.FC<QuickCloseTipModalProps> = (props) => {
  const { visible, handleClose } = props;
  return (
    <Modal
      maskClosable={false}
      onCancel={handleClose}
      onOk={() => {
        window.top.egenie.closeTab('wholeSalePage');
      }}
      open={visible}
      title="提示"
    >
      <div>
        正在支付中，确认关闭吗？
      </div>
    </Modal>
  );
};
