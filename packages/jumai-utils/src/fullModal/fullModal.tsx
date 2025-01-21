import { CloseOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import styles from './fullModal.module.less';

interface ModalProps {
  visible?: boolean;
  title?: React.ReactNode | string;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
  style?: React.CSSProperties;
  operation?: React.ReactNode;
  children?: React.ReactNode;
  titleClassName?: string;
}

export const FullModal = observer((props: ModalProps) => {
  const {
    style = {},
    operation,
    onCancel,
    title,
    children,
    visible,
    titleClassName = '',
  } = props;
  const scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  useEffect(() => {
    if (visible) {
      // 全屏弹窗打开禁止页面滚动
      document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    } else {
      document.getElementsByTagName('html')[0].style.overflow = 'visible';
    }
  }, [visible]);

  return (
    <div
      className={styles.fullModal}
      style={{
        ...style,
        display: visible ? 'block' : 'none',
        top: scrollTop,
      }}
    >
      <div className={styles.contentWrapper}>

        <div className={`${styles.titleWrapper} ${titleClassName}`}>
          <div className={styles.titleContent}>
            <div
              className={styles.closeIcon}
              onClick={onCancel}
            >
              <CloseOutlined/>
            </div>
            <span className={`${styles.title}`}>
              {title}
            </span>
          </div>
          <div>
            {operation}
          </div>
        </div>
        <div className={styles.flex1}>
          {children}
        </div>
      </div>
    </div>
  );
});

