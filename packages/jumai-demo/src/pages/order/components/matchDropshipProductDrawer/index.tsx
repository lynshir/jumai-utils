import React from 'react';
import { Drawer, Checkbox, Alert, Tabs, Space, Button, Form, Select, Input, Radio, Spin } from 'antd';
import { observer } from 'mobx-react';
import { EgGrid } from 'jumai-utils';
import type Store from './store';
import { TAB_ITEMS } from './store';
import styles from './index.less';
import { includes } from 'lodash';

export default observer((props: { store: Store; }) => {
  const { visible, getVendorList, close, activeTabKey, onActiveTabKeyChange, orderProduct, queryFormRef, searchProduct,
    vendorList, grid, queryLoading, vendorProductColorOptions, vendorProductSizeOptions, selectedColor, selectedSize,
    onColorChange, onSizeChange, selectedVendorProduct, onSubmit, matchOtherOrder, onMatchOtherOrderCheckboxChange, submitLoading } = props.store;
  const tabsItem = [
    {
      label: '按SKU编码匹配',
      key: TAB_ITEMS.skuId,
    },
  ];
  if (![
    2,
    3,
  ].includes(orderProduct?.originType)) {
    tabsItem.push({
      label: '按平台SKUID匹配',
      key: TAB_ITEMS.platformSkuId,
    });
  }
  return (
    <Drawer
      footer={(
        <div className={styles.drawerFooter}>
          <Checkbox
            checked={matchOtherOrder}
            onChange={onMatchOtherOrderCheckboxChange}
          >
            匹配其他订单中包含相同商品的明细
          </Checkbox>
          <Space>
            <Button onClick={close}>
              取消
            </Button>
            <Button
              loading={submitLoading}
              onClick={onSubmit}
              type="primary"
            >
              确定
            </Button>
          </Space>
        </div>
      )}
      onClose={close}
      open={visible}
      title="匹配商品代发"
      width={800}
    >
      <Spin spinning={submitLoading}>
        <Alert
          message="替换成功后系统会自动执行预处理服务，请稍等片刻再查询。"
          showIcon
          type="info"
        />
        <div className={styles.contentWrapper}>
          <div className={styles.tabsWrapper}>
            <Tabs
              activeKey={activeTabKey}
              items={tabsItem}
              onChange={onActiveTabKeyChange}
            />
          </div>
          <div className={styles.productWrapper}>
            <img
              className={styles.img}
              // src={orderProduct?.pic_url || noPic}
            />
            <div className={styles.info}>
              <div className={styles.name}>
                {orderProduct?.title}
              </div>
              <div className={styles.sku}>
                SKU编码：
                {orderProduct?.seller_outer_no}
              </div>
              <div className={styles.colorSize}>
                规格：
                {orderProduct?.sku_properties_name}
              </div>
            </div>
          </div>
          <div className={styles.productListWrapper}>
            <Form
              layout="inline"
              onFinish={searchProduct}
              ref={queryFormRef}
            >
              <Form.Item name="vendorId">
                <Select
                  allowClear
                  className={styles.input}
                  filterOption={(input, option) => {
                    return option.label.toLocaleLowerCase().includes(input?.toLocaleLowerCase());
                  }}
                  onSearch={(value) => {
                    getVendorList(value);
                  }}
                  optionFilterProp="children"
                  options={vendorList}
                  placeholder="请选择档口"
                  showSearch
                  style={{ width: 160 }}
                />
              </Form.Item>
              <Form.Item name="goodsName">
                <Input
                  allowClear
                  className={styles.input}
                  placeholder="款式名称"
                />
              </Form.Item>
              <Form.Item name="goodsNo">
                <Input
                  allowClear
                  className={styles.input}
                  placeholder="汇智衣通款式货号"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  className={styles.queryBtn}
                  htmlType="submit"
                  loading={queryLoading}
                  type="primary"
                >
                  查询
                </Button>
              </Form.Item>
            </Form>
            <div className={styles.gridWrapper}>
              <EgGrid store={grid}/>
            </div>
          </div>
          <div className={styles.vendorProductWrapper}>
            <div className={styles.chooseSku}>
              选择SKU
            </div>
            <div className={styles.colorSelectorWrapper}>
              <div>
                颜色：
              </div>
              <Radio.Group
                buttonStyle="solid"
                onChange={onColorChange}
                optionType="button"
                options={vendorProductColorOptions}
                value={selectedColor}
              />
            </div>
            <div className={styles.sizeSelectorWrapper}>
              <div>
                尺码：
              </div>
              <Radio.Group
                buttonStyle="solid"
                onChange={onSizeChange}
                optionType="button"
                options={vendorProductSizeOptions}
                value={selectedSize}
              />
            </div>
            <div className={styles.vendorProductSku}>
              SKU编码：
              {selectedVendorProduct?.goodsSkuNo}
            </div>
          </div>
        </div>
      </Spin>
    </Drawer>
  );
});

