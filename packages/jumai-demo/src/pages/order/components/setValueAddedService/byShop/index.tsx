import React from 'react';
import { observer } from 'mobx-react';
import { Button, Select, Spin, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './index.less';
import type Store from './store';
import EachMaterialComponent from '../components/eachMaterialComponent';

export default observer((props: { store: Store; }) => {
  const { activeShopId, shopConfigServices, loading, handleMaterialOk, handleServiceEnableChange, handleQualifyChange, clearAllService, qualifyId, onSearchShop, parent, handleWashCardChange, washCardId } = props.store;
  const { shopList } = parent;

  const ButtonDict = {
    '1': (
      <Button
        className={styles.buttonClass}
        onClick={() => {
          parent.selectMaterialModal.onOpen(1, handleMaterialOk);
        }}
      >
        选择吊牌
      </Button>
    ),
    '3': (
      <Button
        className={styles.buttonClass}
        onClick={() => {
          parent.selectMaterialModal.onOpen(3, handleMaterialOk);
        }}
      >
        选择包装
      </Button>
    ),
    '4': (
      <div>
        <span className={styles.qualifyLabel}>
          合格证:
        </span>
        <Select
          onChange={handleQualifyChange}
          options={parent.qualifyList}
          style={{ width: '210px' }}
          value={qualifyId}
        />
      </div>
    ),
    '5': (
      <Button
        className={styles.buttonClass}
        onClick={() => {
          parent.selectMaterialModal.onOpen(5, handleMaterialOk);
        }}
      >
        选择好评卡
      </Button>
    ),
    '8': (
      <div>
        <span className={styles.qualifyLabel}>
          水洗唛:
        </span>
        <Select
          onChange={handleWashCardChange}
          options={parent.washCardList}
          style={{ width: '210px' }}
          value={washCardId}
        />
      </div>
    ),
    '9': (
      <Button
        className={styles.buttonClass}
        onClick={() => {
          parent.selectMaterialModal.onOpen(9, handleMaterialOk);
        }}
      >
        换领标
      </Button>
    ),
  };

  return (
    <Spin
      spinning={loading}
      wrapperClassName={styles.spin}
    >
      <div className={styles.setServiceWrapper}>
        <div className={styles.shopWrapper}>
          <div className={styles.shopSearch}>
            <Select
              allowClear
              onChange={onSearchShop}
              optionFilterProp="label"
              options={shopList.map((i) => ({
                label: i.shopName,
                value: i.shopId,
              }))}
              placeholder="输入店铺名称"
              showSearch
              style={{ width: '100%' }}
              suffixIcon={<SearchOutlined/>}
            />
          </div>
          <div className={styles.shopListWrapper}>
            {shopList.map((item) => (
              <div
                className={`${styles.eachShop} ${activeShopId === item.shopId && styles.activeShop} `}
                id={`shopId-${item.shopId}`}
                key={item.shopId}
                onClick={() => {
                  props.store.handleShopChange(item.shopId);
                }}
              >
                {item.shopName}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.shopConfigWrapper}>
          <div className={styles.titleWrapper}>
            <Title text="设置增值服务"/>
            <Button onClick={clearAllService}>
              清空服务
            </Button>
          </div>
          {
            shopConfigServices.map((item, index) => {
              const showMaterial = item.material && item.valueAddedType !== 4 && item.valueAddedType !== 8;
              return (
                <div
                  className={styles.eachConfig}
                  key={item.valueAddedType}
                >
                  <Checkbox
                    checked={item.enable}
                    className={styles.eachCheckbox}
                    onChange={(e) => {
                      handleServiceEnableChange(index, e.target.checked);
                    }}
                  >
                    {item.valueAddedName}
                  </Checkbox>
                  {
                    item.enable ? (
                      <div>
                        {
                          ButtonDict[item.valueAddedType]
                        }
                        {
                          showMaterial ? (
                            <EachMaterialComponent
                              belongType={item.material.belongType}
                              materialName={item.material.materialName}
                              materialType={item.valueAddedType}
                              spec={item.material.spec}
                              url={item.material.pic}
                              weight={item.material.weight}
                            />
                          ) : null
                        }
                      </div>
                    ) : null
                  }
                </div>
              );
            })
          }
        </div>
      </div>
    </Spin>
  );
});

const Title = (props) => {
  return (
    <div className={styles.setTitle}>
      <div className={styles.decoStripe}/>
      <div>
        {props.text}
      </div>
    </div>
  );
};

