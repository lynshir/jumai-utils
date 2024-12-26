import * as React from 'react';
import styles from './index.module.less';

export type ListExtraPosition = 'left' | 'right';
export type ListExtraMap = Partial<Record<ListExtraPosition, React.ReactNode>>;
export type ListExtraContent = React.ReactNode | ListExtraMap;

interface ExtraContentProps {
  position: string;
  extra?: ListExtraContent;
}

const ExtraContent = React.forwardRef<HTMLDivElement, ExtraContentProps>(
  ({ position, extra }, ref) => {
    if (!extra) {
      return null;
    }
    let content: React.ReactNode;

    // Parse extra
    let assertExtra: ListExtraMap = {};

    if (typeof extra === 'object' && !React.isValidElement(extra)) {
      assertExtra = extra as ListExtraMap;
    } else {
      assertExtra.right = extra;
    }

    if (position === 'right') {
      content = assertExtra.right;
    }

    if (position === 'left') {
      content = assertExtra.left;
    }
    return content ? (
      <div
        className={styles.flexNone}
        ref={ref}
      >
        {content}
      </div>
    ) : null;
  }
);

// if (process.env.NODE_ENV !== 'production') {
//   ExtraContent.displayName = 'ExtraContent';
// }

export default ExtraContent;
