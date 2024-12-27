import React from 'react';
import styles from './index.module.less';

export const SummaryContent = (props) => {
  const { list, direction } = props;
  return (
    <div style={{
      display: 'flex',
      flexDirection: direction === 'vertical' ? 'column' : 'row',
    }}
    >
      {
        list.map((el, i) => {
          return (
            <div
              className={styles.summaryContent}
              data-node-key={el.key}
              key={el.key}
            >
              {el.name}
              :
              <strong>
                {el.value}
              </strong>

              <div
                className={styles.divider}
                style={i === list.length - 1 ? { display: 'none' } : {}}
              />
            </div>
          );
        })
      }
    </div>
  );
};
