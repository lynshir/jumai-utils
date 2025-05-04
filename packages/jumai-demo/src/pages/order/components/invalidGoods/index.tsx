import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer } from 'antd';
import type InvalidGoodsModel from './model';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import { NormalProgrammeComponent, MainSubStructure } from 'jumai-utils';
import AddProduct from '../addProduct';

@observer
export default class InvalidGoods extends Component<{ store: InvalidGoodsModel; }> {
  render() {
    const { getDrawerProps, normalProgramme, mainSubStructureModel, addProductModel } = this.props.store;
    return (
      <Drawer {...getDrawerProps}>
        <AddProduct store={addProductModel}/>
        <div className={styles.page}>
          <div className={styles.prompt}>
            <ExclamationCircleOutlined className={styles.icon}/>
            替换成功后系统会自动执行预处理计算仓库、快递等。
          </div>
          <div className={styles.normalProgrammeComponent}>
            <NormalProgrammeComponent store={normalProgramme}/>
          </div>
          <div className={styles.mainSubStructure}>
            <MainSubStructure store={mainSubStructureModel}/>
          </div>
        </div>
      </Drawer>
    );
  }
}
