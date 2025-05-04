import { Button, Drawer, Input, Modal, Space, Tabs, Timeline } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import type Store from './courierQueryStore';
import styles from './index.less';
import { CheckCircleOutlined } from '@ant-design/icons';
import { getStaticResourceUrl } from 'jumai-common';

const STATUS_COLOR = [
  {
    status: '已揽收',
    color: '#EB2FCA',
    backgroundColor: 'rgba(235,47,202,0.1)',
  },
  {
    status: '运输中',
    color: '#1978FF',
    backgroundColor: 'rgba(25,120,255,0.1)',
  },
  {
    status: '派件中',
    color: '#FF5519',
    backgroundColor: 'rgba(255,85,25,0.1)',
  },
  {
    status: '待取件',
    color: '#FF9319',
    backgroundColor: 'rgba(255,147,25,0.1)',
  },
  {
    status: '已签收',
    color: '#0EC998',
    backgroundColor: 'rgba(23,223,170,0.1)',
  },
  {
    status: '拒签',
    color: '#FB071F',
    backgroundColor: 'rgba(251,7,31,0.1)',
  },
];
@observer
export default class CourierQueryModal extends Component<{ store?: Store ; }> {
  render(): ReactNode {
    const { onQuery, orderQueryVisible, onClose, originalOrderNo, platformType } = this.props.store;
    const items = [];
    if (platformType && [
      1,
      17,
      21,
    ].includes(platformType)) {
      items.push({
        label: '平台查询',
        key: '0',
        children: <PlatformQuery store={this.props.store}/>,
      });
    }
    return (
      <Drawer
        footer={(
          <Space className={styles.footer}>
            <Button onClick={onClose}>
              关闭
            </Button>
          </Space>
        )}
        forceRender
        onClose={onClose}
        open={orderQueryVisible}
        title="物流查询"
        width={700}
      >
        {orderQueryVisible ? (
          <Tabs
            className={styles.courierContent}
            items={[
              ...items,
              {
                label: '快递100',
                key: '1',
                children: <ExpressAgeClass store={this.props.store}/>,
              },
              {
                label: '17TRACK',
                key: '2',
                children: <TRACKClass store={this.props.store}/>,
              },
            ]}
            onChange={(value) => {
              if (value === '2') {
                setTimeout(() => {
                  onQuery();
                });
              }
            }}
            tabBarExtraContent={(
              <Button
                onClick={(e) => {
                  window.open(`https://www.baidu.com/s?ie=UTF-8&wd=${originalOrderNo}`);
                }}
                type="link"
              >
                百度查询
              </Button>
            )}
          />
        ) : undefined}
      </Drawer>
    );
  }
}
@observer
class ExpressAgeClass extends React.Component<{ store?: Store ; }> {
  render() {
    const { courierOrderNo100 } = this.props.store;
    return (
      <div
        id="courierContent"
        style={{ height: '100%' }}
      >
        <iframe
          frameBorder="0"
          src={`https://m.kuaidi100.com/app/query/?com=&nu=${courierOrderNo100}&coname=egenie`}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    );
  }
}

@observer
class TRACKClass extends React.Component<{ store?: Store ; }> {
  render() {
    const { courierOrderNo, onQuery, setCourierOrderNo } = this.props.store;
    return (
      <>
        <div className={styles.courierQueryModal}>
          <Input
            className={styles.input}
            maxLength={50}
            onChange={(e) => {
              setCourierOrderNo(e.target.value);
            }}
            placeholder="请输入查询单号"
            value={courierOrderNo}
          />
          <Button
            onClick={onQuery}
            type="primary"
          >
            查询
          </Button>
        </div>
        <div id="YQContainer"/>
      </>
    );
  }
}
@observer
class PlatformQuery extends React.Component<{ store?: Store ; }> {
  render() {
    const { originalOrderNo, params, waybillList } = this.props.store;
    let newStatus;
    STATUS_COLOR?.forEach((item) => {
      if (waybillList?.length && waybillList[0]?.status === item?.status) {
        newStatus = item;
      }
    });
    return (
      <div className={styles.platformQuery}>
        <div className={styles.basicLogisticsInformation}>
          <div>
            快递公司：
            {params?.courierName}
          </div>
          <div>
            快递单号：
            {originalOrderNo}
            {newStatus?.status ? (
              <span
                className={styles.status}
                style={{
                  color: newStatus.color,
                  backgroundColor: newStatus.backgroundColor,
                }}
              >
                {newStatus.status}
              </span>
            ) : undefined}
          </div>
          <div>
            发货时间：
            {params?.courierPrintTime}
          </div>
          <div>
            物流轨迹：
          </div>
        </div>
        {waybillList?.length == 0 ? (
          <div className={styles.empty}>
            <img
              alt="暂无内容！"
              src={getStaticResourceUrl('pc/ts/jumai-common/images/empty.png')}
            />
            <span>
              暂无内容！
            </span>
          </div>
        ) : (
          <div className={styles.trajectory}>
            <Timeline mode="left">
              {waybillList?.map((item, index) => {
                return (
                  <Timeline.Item
                    color={index !== 0 ? 'gray' : undefined}
                    key={`${item.statusTime + index}`}
                    label={item.statusTime}
                  >
                    {index == 0 ? (
                      <div className={styles.info}>
                        <span>
                          {item.status}
                        </span>
                        <span>
                          {item.trace}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.trace}>
                        {item.trace}
                      </span>
                    )}
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </div>
        )}

      </div>
    );
  }
}
