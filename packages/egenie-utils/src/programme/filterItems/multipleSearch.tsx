import { Button, Input, Popover, Space, Tooltip } from 'antd';
import classnames from 'classnames';
import React from 'react';
import styles from './filterItems.module.less';
import type { ENUM_SPLIT_SYMBOL } from './types';
import { trimWhiteSpace } from './utils';

const defaultImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAAAXNSR0IArs4c6QAAADtJREFUKFNjnDln8WGG/4w2DMQAxv9HGEnWQIzByGoYSdZAspNI1kCyk0jWgNdJjP+PpKfE2qKEEqkaAM3SJHdM+2LwAAAAAElFTkSuQmCC';
const activeImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAAAXNSR0IArs4c6QAAADlJREFUKFNjlKz4f5iBgcGGgThwhJFkDcQZjFDFSLIGkp1EsgaSnUSyBgJOOvK8g9EW2VBC8YChAQCYbxdXGT3pswAAAABJRU5ErkJggg==';
const randomId = `randomId_${Math.random()
  .toString()
  .replace('.', '')}_${Date.now()}`;

interface MultipleInputProps {
  style?: React.CSSProperties;
  callback: (value: string) => void;
  splitSymbol: ENUM_SPLIT_SYMBOL;
  value: string;
}

function transformInputValue(value: string, splitSymbol: ENUM_SPLIT_SYMBOL): string {
  return value.split(splitSymbol)
    .filter(Boolean)
    .join('\r\n');
}

function transformOutputValue(value: string, splitSymbol: ENUM_SPLIT_SYMBOL): string {
  return value.split(/\r|\n/g)
    .filter(Boolean)
    .map((item) => trimWhiteSpace(item, true))
    .join(splitSymbol);
}

export const MultipleSearch: React.FC<MultipleInputProps> = function({ style = {}, callback, value, splitSymbol }) {
  const [
    visible,
    setVisible,
  ] = React.useState<boolean>(false);
  const [
    inputValue,
    setInputValue,
  ] = React.useState<string>('');

  React.useEffect(() => {
    if (visible) {
      const newValue = transformInputValue(value, splitSymbol);
      setInputValue(newValue);

      setTimeout(() => {
        const inpObj: HTMLInputElement = document.querySelector(`#${randomId}`);
        if (inpObj?.setSelectionRange) {
          inpObj.setSelectionRange(newValue.length + 1, newValue.length + 1);
        }
      });
    }
  }, [visible]);

  return (
    <Popover
      content={(
        <>
          <Input.TextArea
            autoFocus
            autoSize={{
              minRows: 10,
              maxRows: 10,
            }}
            id={randomId}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="一行一项 按enter换行"
            style={{ width: 240 }}
            value={inputValue}
          />
          <footer className={styles.multipleInputFooter}>
            <Button
              onClick={() => setInputValue('')}
              size="small"
            >
              清空
            </Button>
            <Space>
              <Button
                onClick={() => setVisible(false)}
                size="small"
              >
                关闭
              </Button>
              <Button
                className="egenie-secondary-content"
                onClick={() => {
                  callback(transformOutputValue(inputValue, splitSymbol));
                  setVisible(false);
                }}
                size="small"
              >
                确定
              </Button>
            </Space>
          </footer>
        </>
      )}
      destroyTooltipOnHide
      onVisibleChange={setVisible}
      overlayStyle={{ border: 'none' }}
      placement="bottom"
      title={null}
      trigger="click"
      visible={visible}
    >
      <Tooltip
        placement="rightTop"
        title="批量查询"
      >
        <div
          className={classnames(styles.multipleInputWrapper, { [styles.active]: visible })}
          style={style}
        >
          <img
            height={10}
            src={visible ? activeImg : defaultImg}
            width={12}
          />
        </div>
      </Tooltip>
    </Popover>
  );
};
