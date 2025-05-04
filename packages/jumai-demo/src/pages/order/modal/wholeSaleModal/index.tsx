import { Spin } from 'antd';
import { observer } from 'mobx-react';
import type { ReactNode } from 'react';
import React from 'react';
import styles from './index.less';
import { ActivitionGuide, QuickCloseTipModal } from './modal';
import SetValueAddedServiceModal from '../../components/setValueAddedService';
import WholeSaleStore from './store';
import { LoadingModal } from './components';
import { WorryFreePurchase } from './worryFreePurchase/index';
import { NormalSaleContent } from './normalSale';
import { QuickSaleContent } from './quickSale';

const store = new WholeSaleStore();

// 一键代发
@observer
class WholeSaleModal extends React.Component {
  render(): ReactNode {
    const { spinning, worryFreePurchaseStore, isQuickSale, quickSaleStore } = store;

    const children = (
      <Spin
        size="large"
        spinning={spinning}
        tip="正在生成代发明细"
        wrapperClassName={styles.wholeSaleModal}
      >
        {isQuickSale ? <QuickSaleContent store={quickSaleStore}/> : <NormalSaleContent store={store}/>}
      </Spin>
    );

    return (
      <>
        {children}
        <WorryFreePurchase store={worryFreePurchaseStore}/>
        <ActivitionGuide store={store}/>
        {/* 设置增值服务弹窗 */}
        <SetValueAddedServiceModal store={store.setValueAddedServiceStore}/>
        {/* 支付弹窗loading */}
        <LoadingModal visible={store.loadingVisible}/>
        {/* 确认关闭tab弹窗 */}
        <QuickCloseTipModal
          handleClose={() => {
            store.toggleQuickCloseModal(false);
          }}
          visible={store.showQuickCloseModal}
        />
      </>
    );
  }
}

export default WholeSaleModal;
