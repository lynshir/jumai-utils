import { RenderByCondition } from 'jumai-common';
import { observer } from 'mobx-react';
import React from 'react';
import { SortAndDisplaySetting } from './filterItemsSetting/sortAndDisplaySetting';
import type { ProgrammeListSettingStore } from './programmeListSettingStore';

interface ProgrammeListSettingProps {
  programmeListSettingStore: ProgrammeListSettingStore;
}

export const ProgrammeListSetting = observer(({
  programmeListSettingStore: {
    showModal,
    handleSave,
    displayData,
    handleClose,
    renderLabel,
  },
}: ProgrammeListSettingProps) => {
  return (
    <RenderByCondition show={showModal}>
      <SortAndDisplaySetting
        callback={handleSave}
        description="勾选显示查询方案,支持拖动排序"
        initSettingData={displayData}
        onCancel={handleClose}
        originData={displayData}
        renderLabel={renderLabel}
        showReset={false}
        title="查询方案设置"
      />
    </RenderByCondition>
  );
});
