import React from 'react';
import { observer } from 'mobx-react';
import { Modal, Radio, Spin, Button } from 'antd';
import type Store from './store';
import styles from './index.less';
import EachMaterialComponent from '../eachMaterialComponent';
import { PUBLIC_IMG_URL } from '../../../../../../utils';

export default observer((props: { store: Store; }) => {
  const { visible, modalTitle, loading, materialType, materialList, onSelectedMaterialChange, selectedMaterial, onClose, onOk, getMaterialList } = props.store;

  return (
    <Modal
      bodyStyle={{
        height: 344,
        display: 'flex',
        flexDirection: 'column',
      }}
      centered
      maskClosable={false}
      onCancel={onClose}
      onOk={onOk}
      open={visible}
      title={modalTitle}
      zIndex={1100}
    >
      <Spin
        spinning={loading}
        wrapperClassName={styles.spin}
      >
        <div className={styles.materialFirstLine}>
          <Button onClick={() => {
            window.top.egenie.openTab(`/jumai-ts-wms/materialManage/index?activeMaterialType=${materialType}`, 60161, '物料管理');
          }}
          >
            新建物料
          </Button>
          <Button onClick={getMaterialList}>
            <i className="icon-cxsc"/>
          </Button>
        </div>
        <div style={{
          flex: 1,
          overflow: 'auto',
        }}
        >
          <Radio.Group
            onChange={onSelectedMaterialChange}
            style={{ width: '100%' }}
            value={selectedMaterial}
          >
            {Array.isArray(materialList) && materialList.length > 0 ? materialList.map((item) => (
              <Radio
                className={styles.eachMaterialRadio}
                key={item.materialName}
                value={item.wmsValueAddedMaterialId}
              >
                <EachMaterialComponent
                  belongType={item.belongType}
                  materialName={item.materialName}
                  materialType={materialType}
                  spec={item.spec}
                  url={item.pic}
                  weight={item.weight}
                />
              </Radio>
            )) : (
              <div className={styles.emptyTip}>
                <img
                  className={styles.emptyImg}
                  src={`${PUBLIC_IMG_URL}empty.png`}
                />
                <div className={styles.emptyText}>
                  暂无物料
                </div>
              </div>
            )}
          </Radio.Group>
        </div>
      </Spin>
    </Modal>
  );
});
