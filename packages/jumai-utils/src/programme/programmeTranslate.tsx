import { Typography } from 'antd';
import type { FilterItem, FilterItemOptions, FilterItems } from './filterItems';
import { ENUM_FILTER_ITEM_TYPE, filterInstanceFactory } from './filterItems';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './programmeTranslate.module.less';

@observer
export class ProgrammeTranslate extends React.Component<{ filterItems: FilterItems; schemeValue: string; }> {
  @computed
  public get translateData(): string[][] {
    try {
      const result: FilterItem[] = [];
      const parsedValue = JSON.parse(this.props.schemeValue);
      const originFilterItems = this.props.filterItems.originData;
      originFilterItems.forEach((item) => {
        if (item.field in parsedValue && parsedValue[item.field] !== null && parsedValue[item.field] !== undefined) {
          const options: FilterItemOptions = {
            field: item.field,
            type: item.type,
            label: item.label,
            data: item.data,
          };

          const instance = filterInstanceFactory(options);
          instance.formatValue.call(instance, parsedValue[item.field]);
          if (item.type === ENUM_FILTER_ITEM_TYPE.treeSelect && instance.type === ENUM_FILTER_ITEM_TYPE.treeSelect) {
            instance.treeData = item.treeData;
          }

          if (item.type === ENUM_FILTER_ITEM_TYPE.select && instance.type === ENUM_FILTER_ITEM_TYPE.select) {
            instance.mode = item.mode;
          }
          result.push(instance);
        }
      });

      return result.map((item) => item.translateParams.call(item) as string[])
        .filter((item) => item.length);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  render() {
    return (
      <div className={styles.translateContainer}>
        {
          this.translateData.map((item) => {
            return (
              <section key={item[0]}>
                <Typography.Text
                  ellipsis
                  title={item[0]}
                >
                  {item[0]}
                </Typography.Text>
                <span>
                  :
                </span>
                <span>
                  {item[1]}
                </span>
              </section>
            );
          })
        }
      </div>
    );
  }
}
