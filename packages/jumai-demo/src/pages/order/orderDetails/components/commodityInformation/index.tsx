import { Button, Col, Row, Typography } from 'antd';
import { EgGrid } from 'jumai-utils';
import { observer } from 'mobx-react';
import React from 'react';
import Collapse from '../collapse/index';
import styles from './index.less';
import type store from './model';

interface Interface {
  store: store;
}
const { Text } = Typography;
@observer
export default class extends React.Component<Interface> {
  render() {
    const { parent: { isChecked, commodityStatistics }} = this.props.store;
    const { productInfoEgGridModel: { rows }} = this.props.store.productDetailStore;
    return (
      <Collapse
        title="商品信息"
      >
        <div className={styles.page}>
          <div>
            <Button
              className={`${!isChecked && 'custom'} ${styles.addGoods}`}
              disabled={isChecked}
              onClick={() => {
                this.props.store.productDetailStore.addProduct();
              }}
            >
              添加商品
            </Button>
          </div>
          <div style={{ height: `${40 + (rows?.length ? rows?.length * 120 : 120)}px` }}>
            <EgGrid store={this.props.store.productDetailStore.productInfoEgGridModel}/>
          </div>
          <Row
            className={styles.summary}
            justify="end"
          >
            <Col
              className={styles.col}
              span={3}
            >
              <div>
                <Text className={styles.span}>
                  商品总数量：
                </Text>
                <Text>
                  {commodityStatistics?.totalNum}
                </Text>
              </div>
              <div>
                <Text className={styles.span}>
                  商品总条数：
                </Text>
                <Text>
                  {commodityStatistics?.totalSku}
                </Text>
              </div>

            </Col>
            <Col span={3}>
              <div>
                <Text className={styles.span}>
                  商品总金额：
                </Text>
                <Text>
                  {commodityStatistics?.totalFee || '0.00'}
                </Text>
              </div>
              <div>
                <Text className={styles.span}>
                  邮费：
                </Text>
                <Text>
                  {commodityStatistics?.postFee || '0.00'}
                </Text>
              </div>
              <div>
                <Text className={styles.span}>
                  订单总金额：
                </Text>
                <Text>
                  {(Number(commodityStatistics?.totalFee) + Number(commodityStatistics?.postFee)).toFixed(2)}
                </Text>
              </div>
            </Col>
          </Row>
          <Row
            className={styles.summary}
            justify="end"
            style={{
              borderBottom: 'unset',
              paddingBottom: 4,
            }}
          >
            <Col
              className={styles.col}
              span={3}
            >
              <div>
                <Text
                  className={`${styles.span}`}
                  style={{ marginBottom: 0 }}
                >
                  实付总金额：
                </Text>
                <Text className={styles.payment}>
                  {commodityStatistics?.payment}
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </Collapse>
    );
  }
}
