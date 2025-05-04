import React from 'react';
import styles from './index.less';

interface MarkIconProps{
  className: string;
  color: string;
  context?: string;
}

// 标记
export const MarkIcon = (props: MarkIconProps): JSX.Element => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '22px',
    }}
    >
      <i
        className={`mark-select-icon ${ props.className}`}
        style={{ color: props.color }}
      />
      {/* {props.context} */}
    </span>
  );
};

interface MarkImgProps{
  src: string;
  context?: string;
}

export const MarkImg = (props: MarkImgProps): JSX.Element => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
    }}
    >
      <img
        alt=""
        className="mark-select-img"
        src={props.src}
        style={{
          width: 20,
          height: 20,
        }}
      />
    </span>
  );
};

interface MarkSymbolProps{
  color: string;
  text: string;
  key?: string;
  title?: string;
}

export const MarkSymbol = (props: MarkSymbolProps): JSX.Element => (
  <div
    className={styles.symbolStyle}
    style={{ backgroundColor: `${props.color}` }}
    title={props.title || ''}
  >
    {props.text}
  </div>
);

