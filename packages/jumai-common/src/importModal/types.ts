import type React from 'react';

export interface ImportConditionGroup {
  title: string;
  key: string;
  value?: boolean;
  explain?: React.ReactNode;
  onChangeCallback?: (key: string, checked: boolean) => void;
}

export interface ImportModelProps {
  sheetName: string;
  importConditionGroup?: ImportConditionGroup[];
  onCloseCallback?: () => void;
  otherParams?: Record<string, any>;
}

export interface ImportPercent {
  percent: string;
  taskStatus: number;
  failedOssUrl?: string;
}
