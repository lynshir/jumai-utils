import { Modal, Spin } from 'antd';
import { ExportModal, ProgrammeComponent, ImportModal as ImportModalUtils } from 'jumai-utils';
import { observer } from 'mobx-react';
import type { ReactNode } from 'react';
import React from 'react';
import OrderQueryModal from '../base/courierQuery/courierQueryModal';
import MemoModal from '../base/memo/memoModal';
import RemarkModal from '../base/remark/remarkModal';
import ResultModal from '../base/result/resultModal';
import FreeSplitModal from '../base/skuBreakUp/index';
import SuspendReasonModal from '../base/suspend/suspendModal';
import styles from './index.less';
import OrderModal from './modal/addOrder/addOrderModal';
import AddProductModal from './modal/addProduct/addProductModal';
import BulkExchangeModal from './modal/bulkExchange';
import ByPercentageSplitModal from './modal/byPercentageSplit/byPercentageSplitModal';
import BySkuSplitModal from './modal/bySkuSplit/bySkuSplitModal';
import ByWeight from './modal/byWeight';
import DetailSplitModal from './modal/detailSplit/index';
import ExchangeProductMoal from './modal/exchangeProduct/exchangeProductModal';
import ForcedMergersModal from './modal/forcedMergers/index';
import { ManualDownloadOrder } from './modal/manualDownloadOrder';
import ModifyRemarkModal from './modal/modifyOrderRemark/modifyRemarkModal';
import ModifyReceiverInfoModal from './modal/modifyReceiverInfo';
import ModifyWareCourierModal from './modal/modifyWareCourier/modifyWareCourierModal';
import { PreShipment } from './modal/preShipment';
import ReRunBatchModal from './modal/reRunBatch/reRunBatchModal';
import SetGroupModal from './modal/setGroup/setGroupModal';
import SetMemoModal from './modal/setMemo/setMemoModal';
import ExportOrder from '../components/exportOrder/index';
import { DropShippingTipModal } from './modal/dropShippingTip';
import OrderDetailsModal from './orderDetails';
import { Store } from './store';
import InvalidGoods from './components/invalidGoods';
import ReplaceProductDrawer from './components/replaceProductDrawer';
import MatchDropshipProductDrawer from './components/matchDropshipProductDrawer';
import CryptographicCheck from './components/cryptographicCheck';
import DropShippingAfterTip from './modal/dropShppingAfterTip';
import SetValueAddedService from './components/setValueAddedService';

const store = new Store();

@observer
export default class Order extends React.Component {
  componentDidMount(): void {
    if (store.programme.filterItems.params) { // url含查询参数
      store.programme.gridModel.onQuery();
    }
  }

  private renderEmptySquaresModal(): ReactNode {
    const { visible, emptySquares, onOk } = store;
    return (
      <Modal
        centered
        onCancel={emptySquares}
        onOk={onOk}
        open={visible}
        title="清空格子"
      >
        <div className={styles.body}>
          <span>
            是否确认清空选中订单的格子号?
          </span>
          <span className={styles.attention}>
            注意：如果是已审核的多件订单，可能导致订单和发货单格子号不一致，建议多件订单反审核之后再清空。
          </span>
        </div>
      </Modal>
    );
  }

  render(): ReactNode {
    return (
      <Spin
        size="large"
        spinning={store.spinning}
        tip="Loading..."
        wrapperClassName={styles.wrapperClassName}
      >
        <ExportOrder store={store.exportOrderModel}/>
        <CryptographicCheck store={store.cryptographicCheckModel}/>
        <OrderDetailsModal store={store.orderDetailsModel}/>
        <ProgrammeComponent store={store.programme}/>
        <ImportModalUtils store={store.importModel}/>
        <OrderModal store={store.orderStore}/>
        <MemoModal store={store.memoStore}/>
        <SuspendReasonModal store={store.suspendStore}/>
        <ResultModal store={store.resultStore}/>
        <RemarkModal store={store.remarkStore}/>
        <OrderQueryModal store={store.courierQueryStore}/>
        <AddProductModal store={store.addProductStore}/>
        <ExchangeProductMoal store={store.exchangeProductStore}/>
        <ModifyWareCourierModal store={store.modifyWareCourierStore}/>
        <ModifyRemarkModal store={store.modifyRemarkStore}/>
        <SetGroupModal store={store.setGroupStore}/>
        <SetMemoModal store={store.setMemoStore}/>
        <ReRunBatchModal store={store.reRunBatchStore}/>
        <BySkuSplitModal store={store.bySkuSplitStore}/>
        <DetailSplitModal store={store.detailSplitStore}/>
        <ByPercentageSplitModal store={store.byPercentageStore}/>
        <FreeSplitModal store={store.freeSplitStore}/>
        <ModifyReceiverInfoModal store={store.modifyReceiverInfoStore}/>
        <PreShipment store={store.preShipmentModel}/>
        <ExportModal store={store.exportStore}/>
        <BulkExchangeModal store={store.bulkExchangeStore}/>
        <ForcedMergersModal store={store.forcedMergersModel}/>
        <ManualDownloadOrder store={store.manualDownloadOrderModel}/>
        <ByWeight store={store.byWeightModel}/>
        <InvalidGoods store={store.invalidGoodsModel}/>
        {/* 代发弹窗 */}
        <DropShippingTipModal store={store.dropShippingTipStore}/>
        {this.renderEmptySquaresModal()}
        <ReplaceProductDrawer store={store.replaceProductStore}/>
        <MatchDropshipProductDrawer store={store.matchDropshipProductStore}/>
        <DropShippingAfterTip store={store.dropShippingAfterTipsStore}/>
        <SetValueAddedService store={store.setValueAddedServiceStore}/>
      </Spin>
    );
  }
}
