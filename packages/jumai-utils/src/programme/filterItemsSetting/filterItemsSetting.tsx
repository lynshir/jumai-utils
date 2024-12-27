import React from 'react';
import { observer } from 'mobx-react';
import { RenderByCondition } from 'jumai-common';
import { SortAndDisplaySetting } from './sortAndDisplaySetting';
import type { FilterItemsSettingStore } from './filterItemsSettingStore';

interface FilterItemsSettingProps {
  filterItemsSettingStore: FilterItemsSettingStore;
}

export const FilterItemsSetting = observer(({
  filterItemsSettingStore: {
    showModal,
    handleSave,
    handleClose,
    originSettingData,
    initSettingData,
  },
}: FilterItemsSettingProps) => {
  return (
    <RenderByCondition show={showModal}>
      <SortAndDisplaySetting
        callback={handleSave}
        description="勾选显示查询项,支持拖动排序"
        initSettingData={initSettingData}
        onCancel={handleClose}
        originData={originSettingData}
        showReset
        title="查询项设置"
      />
    </RenderByCondition>
  );
});
