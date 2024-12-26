import { Tabs } from 'antd';
import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { TabsProgramme } from './tabsProgramme';
import type { TabsProgrammeComponentProps } from './types';
import styles from './tabsProgramme.module.less';
import { NormalProgrammeComponent } from '../normalProgramme/normalProgrammeComponent';

export const TabsProgrammeComponent = observer(({
  tabsProgramme: {
    activeKey,
    handleActiveKeyChange,
    tabsData,
    normalProgramme,
  },
  className = '',
  style = {},
}: TabsProgrammeComponentProps) => {
  const items = tabsData.map((item) => ({
    key: item.key,
    label: TabsProgramme.renderTabsLabel(item),
  }));
  return (
    <div
      className={classnames(styles.tabsProgrammeContainer, className)}
      style={style}
    >
      <Tabs
        activeKey={activeKey}
        items={items}
        onChange={handleActiveKeyChange}
      />
      <footer>
        <NormalProgrammeComponent store={normalProgramme}/>
      </footer>
    </div>
  );
});
