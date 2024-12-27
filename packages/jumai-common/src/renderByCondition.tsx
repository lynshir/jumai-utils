import type React from 'react';

interface RenderByConditionProps {
  children: React.ReactElement;
  show: boolean;
}

export const RenderByCondition = function({
  children,
  show,
}: RenderByConditionProps): React.ReactElement {
  return show ? children : null;
};
