import { Popover } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './index.less';

function showPic(imgEle, pic: string, color: string, size: string, productNo: string) {
  if (!document.getElementById('picImgContainer')) {
    const picDiv = document.createElement('div');
    document.body.appendChild(picDiv);
    picDiv.id = 'picImgContainer';
    ReactDOM.render(
      <ImgComponent
        color={color}
        productNo={productNo}
        size={size}
        src={pic}
      />,
      document.getElementById('picImgContainer')
    );
  }

  const imgRect = imgEle.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;

  // 暂不考虑水平方向空间不够的问题
  const x = imgRect.left;

  // 正常情况放图片底部,空间不够放顶部
  const y = viewHeight - imgRect.bottom < 200 ? imgRect.top - 200 - 2 : imgRect.bottom + 2;
  const picStyle = document.getElementById('picImgContainer').style;
  picStyle.display = 'block';
  picStyle.border = '0px';
  picStyle.position = 'absolute';
  picStyle.left = `${x}px`;
  picStyle.top = `${y}px`;
  picStyle.zIndex = '99999';
}

interface IProps{
  src: string;
  productNo: string;
  color: string;
  size: string;
  height?: number;
  width?: number;
}

// popover方案（使用popover的话hover会产生多个div，暂时不想用）
const popContent = (props: IProps) => {
  const { width = 140, height = 140, src, productNo, size, color } = props;
  return (
    <>
      <img
        height={height}
        src={src}
        width={width}
      />
      <div className={`${styles.productNo} ${styles.imgText}`}>
        {productNo}
      </div>
      <div className={styles.imgText}>
        {color}
        {' '}
        {size}
      </div>
    </>
  );
};

const ImgComponent = (props: IProps) => {
  const { width = 140, height = 140, src, productNo, size, color } = props;
  return (
    <div className={styles.imgPopWrapper}>
      <img
        height={height}
        // src={src || noPic}
        width={width}
      />
      <div className={`${styles.productNo} ${styles.imgText}`}>
        {productNo}
      </div>
      <div className={styles.imgText}>
        {color}
        {' '}
        {size}
      </div>
    </div>
  );
};

// 隐藏pic
function hidePic() {
  const picContainer = document.getElementById('picImgContainer');
  picContainer.remove();
}

interface IImgProps {
  pic: string;
  productNo: string;
  colorType: string;
  sizeType: string;
}

export const ImgWithInfoFormatter: React.FC<IImgProps> = function({ pic, productNo, colorType, sizeType }): JSX.Element {
  return (
    <div className={styles.imgWrapper}>
      {/* <Popover
        content={popContent({
          src={src || noPic}
          productNo: productNo,
          color: colorType,
          size:sizeType,
        })}
        overlayClassName={styles.popWrapper}
        placement="bottom"
      >
        <img
          className={styles.imgStyle}
          src={value}
          style={{
            width: width || '30px',
            height: height || '30px',
            verticalAlign: 'baseline',
          }}
        />
      </Popover> */}
      <img
        className={styles.imgStyle}
        onMouseLeave={hidePic}
        onMouseOver={(e) => showPic(e.target, pic, colorType, sizeType, productNo)}
        src={pic || noPic}
        style={{
          width: '30px',
          height: '30px',
          verticalAlign: 'baseline',
        }}
      />
    </div>
  );
};

