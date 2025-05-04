import { Modal, Steps, Button } from 'antd';
import React from 'react';
import type WholeSaleStore from '../../store';
import styles from '../../index.less';
import { observer } from 'mobx-react';
import { PUBLIC_IMG_URL } from '../../../../../../utils';

const { Step } = Steps;

export const ActivitionGuide: React.FC<{ store: WholeSaleStore; }> = observer((props) => {
  const { showActivationGuide, toggleActivationGuide, setServiceStore } = props.store as any;
  return (
    <Modal
      footer={(
        <Button
          onClick={() => {
            toggleActivationGuide(false);
          }}
          type="primary"
        >
          知道了
        </Button>
      )}
      maskClosable={false}
      onCancel={() => {
        toggleActivationGuide(false);
      }}
      open={showActivationGuide}
      title="增值服务开通指南"
    >
      <Steps
        className={styles.steps}
        direction="vertical"
      >
        <Step
          description={(
            <div>
              <img
                src={`${PUBLIC_IMG_URL}activationGuide.png`}
                style={{ width: '164px' }}
              />
            </div>
          )}
          title="联系客服，开通服务，请扫描二维码"
        />
        <Step
          description={(
            <div>
              <a
                onClick={() => {
                  window.top.egenie.openTab('/jumai-ts-wms/materialManage/index', 60161, '物料管理');
                }}
              >
                创建物料
                {'>'}
              </a>
            </div>
          )}
          status="process"
          title="创建物料，并将物料寄送到网仓"
        />
        <Step
          description={(
            <div>
              <a onClick={() => {
                setServiceStore && setServiceStore.show();
              }}
              >
                设置服务
                {'>'}
              </a>
            </div>
          )}
          status="process"
          title="设置增值服务"

        />
        <Step
          status="process"
          title="网仓收到物料后，根据订单执行服务"
        />
      </Steps>
    </Modal>
  );
});
