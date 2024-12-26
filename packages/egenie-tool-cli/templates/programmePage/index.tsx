import { ProgrammeComponent } from 'egenie-utils';
import React, { useMemo } from 'react';
import Store from './store';
import styles from './index.less';

export default function() {
  const store = useMemo(() => new Store(), []);
  const {
    programme,
  } = store;
  return (
    <div className={styles.page}>
      <ProgrammeComponent store={programme}/>
    </div>
  );
}

