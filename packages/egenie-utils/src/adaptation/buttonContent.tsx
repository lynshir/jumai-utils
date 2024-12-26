import React from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import styles from './index.module.less';

export const ButtonContent = observer((props) => {
  const { list, direction } = props;
  return (
    <div
      className={`${styles.flex} ${styles.aiCenter} ${styles.h100} ${direction === 'vertical' ? styles.fdColumn : null}`}
    >
      {
        list.map((el) => {
          return (
            <Button
              data-node-key={el.key}
              key={el.key}
              onClick={() => {
                el.onClick && el.onClick();
              }}
              style={{ padding: '4px 2px' }}

              // size="small"
              type="link"
            >
              {el.name}
            </Button>
          );
        })
      }
    </div>
  );
});
