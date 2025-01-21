import { useState } from 'react';

export interface TransformType {
  x: number;
  y: number;
  scale: number;
  rotate: number;
}

const initialTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
};

export default function useTransform() {
  const [
    transform,
    setTransform,
  ] = useState(initialTransform);

  const resetTransform = () => {
    setTransform((prevTransform) => {
      // 恢复到最近的正向角度，避免多余的动画效果
      const rotate = Math.floor(prevTransform.scale / 360) * 360;
      return {
        x: 0,
        y: 0,
        rotate,
        scale: 1,
      };
    });
  };

  const updateTransform = (newTransform: Partial<TransformType>) => {
    setTransform((prevTransform) => ({
      ...prevTransform,
      ...newTransform,
    }));
  };

  return {
    transform,
    updateTransform,
    resetTransform,
  };
}
