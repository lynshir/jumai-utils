import React from 'react';
import { Tooltip } from 'antd';
import styles from './index.module.less';
import { SummaryContent } from './summaryContent';
import type { ListProps } from './interface';
import { ButtonContent } from './buttonContent';

const Operation = (props: ListProps, ref: React.Ref<HTMLDivElement>) => {
  const { list, placement, operationDirection, type, moreIcon } = props;
  const titleContent = () => {
    switch (type) {
      case 'button':
        return (
          <ButtonContent
            direction={operationDirection}
            list={list}
          />
        );
      default:
        return (
          <SummaryContent
            direction={operationDirection}
            list={list}
          />
        );
    }
  };

  return (
    <Tooltip
      color="white"
      overlayClassName={styles.toolTip}
      placement={placement || 'bottom'}
      title={titleContent}
    >
      {
        moreIcon ? moreIcon : (
          <div
            className={`${styles.defaultOper} ${!list?.length && styles.operation}`}
            ref={ref}
          >
            {new Array(3).fill(0)
              .map((el, i) => {
                return (
                  <div
                    className={styles.circle}
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                  />
                );
              })}
          </div>
        )
      }

    </Tooltip>
  );
};

export const OperationNode = React.memo(
  React.forwardRef(Operation)
);
