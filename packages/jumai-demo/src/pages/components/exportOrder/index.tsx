import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, Modal } from 'antd';
import { observer } from 'mobx-react';
import { nanoid } from 'nanoid';
import React from 'react';
import styles from './index.less';
import type ExportOrderModel from './model';

@observer
class ExportOrder extends React.Component<{ store?: ExportOrderModel; }> {
  componentDidMount() {
    this.props.store.getPhone();
  }

  render() {
    const { store } = this.props;
    return (
      <Modal
        className={styles.exportOrder}
        footer={[
          <Button
            key={nanoid()}
            onClick={() => store.changeVisible(false, '', '', '', '', '')}
          >
            取消
          </Button>,
          <Button
            key={nanoid()}
            onClick={() => store.export()}
            type="primary"
          >
            确认导出
          </Button>,
        ]}
        onCancel={() => store.changeVisible(false, '', '', '', '', '')}
        open={store.visible}
        title="导出订单（包含收件人信息）"
        width={800}
      >
        {/* <div className={styles.tip}>
          <ExclamationCircleOutlined className={styles.tipIcon}/>
          为了防止导出失败，请提前在平台申请足够的解密额度。
          <a
            className={styles.toOther}
            href="https://www.yuque.com/egenie/instruction/fr10wo"
            rel="noreferrer"
            target="_blank"
          >
            点击查看
          </a>
          解密提额教程。
        </div> */}
        <p>
          为了保护消费者个人信息和隐私数据安全，此操作需要手机验证码验证。
        </p>
        <p>
          手机号：
          {store.phone}
        </p>
        <div className={styles.verificationCode}>
          <span>
            验证码：
          </span>
          <Input
            className={styles.verificationCodeInput}
            onChange={(e) => {
              store.verificationCode = e.target.value;
            }}
            placeholder="请输入验证码"
            value={store.verificationCode}
          />
          {!store.isGetVerificationCode ? (
            <Button
              className={styles.verificationCodeBtn}
              disabled={store.isGetVerificationCode}
              onClick={() => store.getVerificationCode()}
              type="primary"
            >
              获取验证码
            </Button>
          ) : undefined}
          {store.isGetVerificationCode && (
            <span className={styles.verificationCodeTime}>
              {store.time}
              s后重新获取
            </span>
          )}
        </div>
      </Modal>
    );
  }
}

export default ExportOrder;
