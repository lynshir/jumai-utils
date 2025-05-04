import React from 'react';
import { observer } from 'mobx-react';
import { SearchListStructure } from 'jumai-utils';
import type Store from './store';
import styles from './index.less';
import SetServiceModal from './setServiceModal';

export default observer((props: { store: Store; }) => {
  const { searchListModal, setServiceStore } = props.store;

  return (
    <div className={styles.wrapper}>
      <SearchListStructure store={searchListModal}/>
      <SetServiceModal store={setServiceStore}/>
    </div>
  );
});
