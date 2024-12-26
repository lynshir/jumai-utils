import { TreeSelect } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { FilterItemLabel } from '../utils';
import type { FilterTreeSelect } from './filterTreeSelect';

@observer
export class FilterTreeSelectComponent extends React.Component<{ store: FilterTreeSelect; }> {
  render() {
    const {
      value,
      onChange,
      placeholder,
      allowClear,
      disabled,
      style,
      className,
      label,
      showSearch,
      labelWidth,
      dropdownClassName,
      dropdownMatchSelectWidth,
      listHeight,
      loadData,
      multiple,
      treeExpandedKeys,
      treeNodeFilterProp,
      treeData,
      onTreeExpand,
      treeCheckable,
      showCheckedStrategy,
      maxTagCount,
      treeDataSimpleMode,
      autoClearSearchValue,
      dropdownStyle,
      showArrow,
      suffixIcon,
      switcherIcon,
      treeDefaultExpandAll,
      treeDefaultExpandedKeys,
      treeIcon,
      onSelect,
      required,
    } = this.props.store;
    return (
      <div
        className={`filterTreeSelect ${className}`}
        style={toJS(style)}
      >
        <FilterItemLabel
          label={label}
          labelWidth={labelWidth}
          required={required}
        />
        <section style={{ width: `calc(100% - ${labelWidth}px)` }}>
          <TreeSelect
            allowClear={allowClear}
            autoClearSearchValue={autoClearSearchValue}
            bordered={false}
            disabled={disabled}
            dropdownClassName={dropdownClassName}
            dropdownMatchSelectWidth={dropdownMatchSelectWidth}
            dropdownStyle={dropdownStyle}
            listHeight={listHeight}
            loadData={loadData}
            maxTagCount={maxTagCount}
            multiple={multiple}
            onChange={onChange}
            onSelect={onSelect}

            // @ts-ignore
            onTreeExpand={onTreeExpand}
            placeholder={placeholder}
            showArrow={showArrow}
            showCheckedStrategy={showCheckedStrategy}
            showSearch={showSearch}
            suffixIcon={suffixIcon}
            switcherIcon={switcherIcon}
            treeCheckable={treeCheckable}
            treeData={treeData}
            treeDataSimpleMode={treeDataSimpleMode}
            treeDefaultExpandAll={treeDefaultExpandAll}
            treeDefaultExpandedKeys={treeDefaultExpandedKeys}
            treeExpandedKeys={treeExpandedKeys}
            treeIcon={treeIcon}
            treeNodeFilterProp={treeNodeFilterProp}
            value={value}
          />
        </section>
      </div>
    );
  }
}
