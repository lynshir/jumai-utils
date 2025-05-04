import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd';
import React, { useState, useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface IProps {
  children: ReactElement;
  param: TooltipProps;
}

// 只给文本溢出的区域加tooltip
const TooltipEllipsis = (props: IProps): ReactElement => {
  const [
    showToolTip,
    setShowTooltip,
  ] = useState(true);

  useEffect(() => {
    renderChildren();
  }, []);

  const renderChildren = () => {
    return (
      React.cloneElement(
        props.children, { ref: refChildren }
      )
    );
  };
  const refChildren = (ref) => {
    if (!ref) {
      return;
    }
    const { scrollWidth, clientWidth } = ref;
    setShowTooltip(scrollWidth > clientWidth);
  };

  if (showToolTip) {
    return (
      <Tooltip
        {...props.param}
      >
        {renderChildren()}
      </Tooltip>
    );
  }
  return renderChildren();
};

export default TooltipEllipsis;
