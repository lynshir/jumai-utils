import React from 'react';
import { Modal, Button, Select, Checkbox, Spin } from 'antd';
import { observer } from 'mobx-react';
import type Store from './store';
import styles from './index.less';
import EachMaterialComponent from '../../components/eachMaterialComponent';
import type { Service } from '../interface';

export default observer((props: { store: Store; }) => {
  const { visible, services, onServiceEnableChange, onClose, rootStore, onMaterialChange, loading, onQualifyChange, onOk, onWashCardChange, onClickClearButton } = props.store;

  const renderButton = (service: Service) => {
    let content = null;
    switch (service.valueAddedType) {
      case 1:
        content = (
          <Button
            className={styles.buttonClass}
            onClick={() => {
              rootStore().selectMaterialModal.onOpen(1, onMaterialChange);
            }}
          >
            选择吊牌
          </Button>
        );
        break;
      case 3:
        content = (
          <Button
            className={styles.buttonClass}
            onClick={() => {
              rootStore().selectMaterialModal.onOpen(3, onMaterialChange);
            }}
          >
            选择包装
          </Button>
        );
        break;
      case 4:
        content = (
          <div>
            <span className={styles.qualifyLabel}>
              合格证:
            </span>
            <Select
              onChange={onQualifyChange}
              options={rootStore().qualifyList}
              style={{ width: '210px' }}
              value={service.material?.wmsValueAddedMaterialId}
            />
          </div>
        );
        break;
      case 5:
        content = (
          <Button
            className={styles.buttonClass}
            onClick={() => {
              rootStore().selectMaterialModal.onOpen(5, onMaterialChange);
            }}
          >
            选择好评卡
          </Button>
        );
        break;
      case 8:
        content = (
          <div>
            <span className={styles.qualifyLabel}>
              水洗唛:
            </span>
            <Select
              onChange={onWashCardChange}
              options={rootStore().washCardList}
              style={{ width: '210px' }}
              value={service.material?.wmsValueAddedMaterialId}
            />
          </div>
        );
        break;
      case 9:
        content = (
          <Button
            className={styles.buttonClass}
            onClick={() => {
              rootStore().selectMaterialModal.onOpen(9, onMaterialChange);
            }}
          >
            选择领标
          </Button>
        );
        break;
      default:
        break;
    }
    return content;
  };

  return (
    <Modal
      bodyStyle={{ maxHeight: 800 }}
      centered
      confirmLoading={loading}
      maskClosable={false}
      okText="完成"
      onCancel={onClose}
      onOk={onOk}
      open={visible}
      title="选择增值服务"
    >
      <Spin spinning={loading}>
        <Button
          className={styles.clearButton}
          onClick={onClickClearButton}
        >
          清空服务
        </Button>
        <div className={styles.contentWrapper}>
          {
            services.map((item, index) => {
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
                      onServiceEnableChange(index, e.target.checked);
                    }}
                  >
                    {item.valueAddedName}
                  </Checkbox>
                  {
                    item.enable ? (
                      <div>
                        {renderButton(item)}
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
          
      </Spin>
    </Modal>
  );
});
