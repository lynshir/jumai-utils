import React from 'react';
import type { ImageProps } from 'jumai-common';
import { Image } from 'jumai-common';

export const ImgFormatter: React.FC<{ value?: string; borderRadius?: string; } & ImageProps> = function({
  value,
  borderRadius,
  style,
  width = 30,
  height = 30,
  previewWidth = 280,
  previewHeight = 280,
  ...rest
}) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
      }}
    >
      <Image
        height={height}
        previewHeight={previewHeight}
        previewWidth={previewWidth}
        src={value}
        style={{
          verticalAlign: 'baseline',
          borderRadius: borderRadius || 0,
          ...style,
        }}
        width={width}
        {...rest}
      />
    </div>
  );
};
