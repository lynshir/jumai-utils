import { Input, Radio } from 'antd';
import _ from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import styles from '../filterItems.module.less';
import { throttleTime } from '../utils';
import type { FilterRadio } from './filterRadio';

@observer
export class FilterRadioComponent extends React.Component<{ store: FilterRadio; }> {
  public handlePressEnter: React.KeyboardEventHandler = _.throttle((event) => {
    if (!this.props.store._isLoading) {
      if (typeof this.props.store.onPressEnter === 'function') {
        this.props.store.onPressEnter();
      }
    }
  }, throttleTime);

  render() {
    const {
      inputValue,
      handleInputChange,
      placeholder,
      style,
      className,
      data,
      handleSelectValue,
      value,
      inputRef,
      handleInputClick,
      disabled,
    } = this.props.store;
    return (
      <div
        className={`${styles.filterInputOrRadio} ${className}`}
        style={toJS(style)}
      >
        <Radio.Group
          disabled={disabled}
          value={value}
        >
          {
            data.map((item) => (
              <Radio
                key={item.value}
                onClick={() => handleSelectValue(item.value)}
                value={item.value}
              >
                {item.label}
                {
                  item.showInput ? (
                    <Input
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                      onPressEnter={this.handlePressEnter}
                      placeholder={placeholder}
                      ref={inputRef}
                      size="small"
                      value={inputValue}
                    />
                  ) : null
                }
              </Radio>
            ))
          }
        </Radio.Group>
      </div>
    );
  }
}
