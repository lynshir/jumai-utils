import { Button, Select, Switch } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import styles from '../filterItems.module.less';
import { FilterItemLabel } from '../utils';
import type { FilterSelect } from './filterSelect';

@observer
export class FilterSelectComponent extends React.Component<{ store: FilterSelect; }> {
  render() {
    const {
      value,
      onChange,
      disabled,
      style,
      className,
      placeholder,
      allowClear,
      showSearch,
      options,
      searchValue,
      onSearch,
      mode,
      label,
      labelWidth,
      required,
      showArrow,
      showChooseAll,
      isLeftMatch,
      handleLeftMatch,
      handleChooseAll,
    } = this.props.store;
    return (
      <div
        className={`filterSelect ${className}`}
        style={toJS(style)}
      >
        <FilterItemLabel
          label={label}
          labelWidth={labelWidth}
          required={required}
        />
        <Select
          allowClear={allowClear}
          autoClearSearchValue
          bordered={false}
          disabled={disabled}
          dropdownMatchSelectWidth
          dropdownRender={mode && showChooseAll ? (menu) => {
            return (
              <>
                {menu}
                <div className={styles.filterSelectChooseAll}>
                  <section>
                    搜索左匹配&nbsp;
                    <Switch
                      checked={isLeftMatch}
                      onChange={handleLeftMatch}
                      size="small"
                    />
                  </section>
                  <section>
                    <Button
                      onClick={handleChooseAll}
                      size="small"
                      type="primary"
                    >
                      全选
                    </Button>
                  </section>
                </div>
              </>
            );
          } : null}

          filterOption={() => true}
          getPopupContainer={(nodeItem) => nodeItem.parentElement}
          maxTagCount="responsive"
          mode={mode}
          onChange={onChange}
          onDropdownVisibleChange={(open) => {
            if (!open) {
              onSearch('');
            }
          }}
          onSearch={onSearch}
          options={options}
          placeholder={placeholder}
          searchValue={searchValue}
          showArrow={showArrow}
          showSearch={showSearch}
          style={{ width: `calc(100% - ${labelWidth}px)` }}
          value={toJS(value)}
          virtual={false}
        />
      </div>
    );
  }
}
