import type { ValueAndLabelData } from '../filterItems';
import type { TabsProgramme } from './tabsProgramme';
import type React from 'react';
import type { NormalProgramme } from '../normalProgramme/normalProgramme';

export interface TabsProgrammeComponentProps {
  tabsProgramme: TabsProgramme;
  className?: string;
  style?: React.CSSProperties;
}

export interface TabsProgrammeParams {
  normalProgramme: NormalProgramme;
  activeKey: string;
  data?: ValueAndLabelData;
  tabsToParams: ((activeKey?: string) => Record<string, any>) | string;
  activeKeyChangeCallback?: (activeKey?: string, ...args: any[]) => any;
}
