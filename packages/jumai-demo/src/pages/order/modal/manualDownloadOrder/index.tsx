import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Modal, Radio, Tabs } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import { nanoid } from 'nanoid';
import React from 'react';
import styles from './index.less';
import type { ManualDownloadOrderModel } from './model';

@observer
export class ManualDownloadOrder extends React.Component<{ store?: ManualDownloadOrderModel; }> {
  componentDidMount(): void {
    this.props.store.init();
  }

  render() {
    const { store } = this.props;
    return (
      <Modal
        className={styles.manualDownloadOrder}
        footer={[
          <Button
            key={nanoid()}
            onClick={() => store.changeVisible(false)}
          >
            取消
          </Button>,
          <Button
            key={nanoid()}
            loading={store.loading}
            onClick={() => store.startDownload()}
            type="primary"
          >
            开始下载
          </Button>,
        ]}
        maskClosable={false}
        onCancel={() => store.changeVisible(false)}
        open={store.visible}
        title="手动同步订单"
        width={800}
      >
        <Tabs
          activeKey={store.activeKey}
          onChange={(e) => store.changeTab(e)}
        >
          <Tabs.TabPane
            key="dateRange"
            tab="按时间段下载"
          >
            <RangeDownload store={store}/>
          </Tabs.TabPane>
          <Tabs.TabPane
            key="platformNo"
            tab="按平台单号下载"
          >
            <PlatformNoDownload store={store}/>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    );
  }
}

// 按时间段下载
@observer
class RangeDownload extends React.Component<{ store?: ManualDownloadOrderModel; }> {
  render() {
    const { store } = this.props;
    return (
      <div className={styles.rangeDownload}>
        <p className={styles.tip}>
          <ExclamationCircleOutlined className={styles.tipIcon}/>
          按时间点下载订单速度较慢，点击开始下载后，请稍等几分钟再查看结果。
        </p>
        <Input.Search
          allowClear
          className={styles.search}
          maxLength={50}
          onChange={(e) => {
            store.searchValue = e.target.value;
          }}
          onSearch={(value, e) => store.searchShop(value, e)}
          placeholder="搜索店铺"
          value={store.searchValue}
        />
        <div className={styles.tableContainer}>
          <div className={styles.table}>
            <EgGrid store={store.egGridModel}/>
          </div>
          <div className={styles.datePickerBox}>
            <div>
              开始时间：
              <DatePicker
                allowClear={false}
                className={styles.datePicker}
                onChange={(e) => {
                  store.startDate = e;
                }}
                showTime
                value={store.startDate}
              />
            </div>
            <div>
              结束时间：
              <DatePicker
                allowClear={false}
                className={styles.datePicker}
                onChange={(e) => {
                  store.endDate = e;
                }}
                showTime
                value={store.endDate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// 按平台单号下载
@observer
class PlatformNoDownload extends React.Component<{ store?: ManualDownloadOrderModel; }> {
  render() {
    const { store } = this.props;
    return (
      <div className={styles.platformNoDownload}>
        <div className={styles.store}>
          <Input.Search
            allowClear
            className={styles.search}
            maxLength={50}
            onChange={(e) => {
              store.searchValue = e.target.value;
            }}
            onSearch={(value, e) => store.searchShop(value, e)}
            placeholder="搜索店铺"
            value={store.searchValue}
          />
          <Radio.Group
            className={styles.radioGroup}
            onChange={(e) => {
              store.storeRadio = e.target.value;
            }}
            value={store.storeRadio}
          >
            {
              store.storeList.map((item) => (
                <Radio
                  className={styles.radio}
                  key={item.shop_id}
                  value={item.shop_id}
                >
                  {item.shop_name}
                </Radio>
              ))
            }
          </Radio.Group>
        </div>
        <div className={styles.platform}>
          <p>
            请输入平台单号：
          </p>
          <Input.TextArea
            className={styles.textArea}
            onChange={(e) => {
              store.platformNos = e.target.value;
            }}
            placeholder="多个平台单号换行输入，例如&#10;20220314185239226&#10;20220314185152365"
            value={store.platformNos}
          />
        </div>
      </div>
    );
  }
}
