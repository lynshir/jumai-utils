import { action, autorun, observable } from 'mobx';
import React from 'react';
import { FILTER_ITEMS_COLLAPSE_PREFIX } from './constants';
import type { Programme } from './programme';
import styles from './programme.module.less';

export class ProgrammeInteractiveStore {
  constructor(private parent: Programme) {
    this.collapsed = window.localStorage.getItem(`${FILTER_ITEMS_COLLAPSE_PREFIX}${this.parent.moduleName}`) === 'true';
  }

  @observable public collapsed: boolean;

  @action public handleCollapsed = (): void => {
    this.collapsed = !this.collapsed;
    window.localStorage.setItem(`${FILTER_ITEMS_COLLAPSE_PREFIX}${this.parent.moduleName}`, String(this.collapsed));
  };

  public scrollContainerRef = React.createRef<HTMLDivElement>();

  @observable public showScroll = false;

  @action public handleScroll = () => {
    this.showScroll = true;
  };

  @action public clickCloseScroll = () => {
    this.showScroll = false;
  };

  @action public clickPreventCloseScroll = (event) => {
    event.stopPropagation();
    this.showScroll = true;
  };

  public handleFilterItemsValueChangeDisposer?: () => void;

  public handleFilterItemsValueChangeObserver = () => {
    this.handleFilterItemsValueChangeDisposer = autorun(() => {
      const totalField: string[] = this.parent.filterItems.actualData.map((item) => item.field);
      const paramsField: string[] = this.parent.filterItems.actualData.filter((item) => Object.keys(item.toParams.call(item)).length > 0)
        .map((item) => item.field);
      const paramsActiveClassName = styles.paramActive;

      totalField.forEach((field) => {
        const element: HTMLDivElement = document.querySelector(`.${styles.container} #${FILTER_ITEMS_COLLAPSE_PREFIX}${field}`);
        if (element) {
          element.classList.remove(paramsActiveClassName);
        }
      });

      paramsField.forEach((field) => {
        const element: HTMLDivElement = document.querySelector(`.${styles.container} #${FILTER_ITEMS_COLLAPSE_PREFIX}${field}`);
        if (element) {
          element.classList.add(paramsActiveClassName);
        }
      });
    });
  };
}
