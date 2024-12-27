import React, { useState, useEffect, useRef } from 'react';
import ReactDom from 'react-dom';
import { Space } from 'antd';
import { CloseOutlined, DownloadOutlined, RotateLeftOutlined, RotateRightOutlined, ZoomOutOutlined, ZoomInOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import cx from 'classnames';
import { Image as EgenieImage } from 'jumai-common';
import useTransform from './hooks/useTransform';
import styles from './index.module.less';

export interface ImagePreviewModalProps {
  visible: boolean;
  onCancel: () => void;
  images: string[];
  current?: number;
  style?: React.CSSProperties;
  zIndex?: number;
}

// 下载图片
export const downloadImage = (url: string) => {
  if (url) {
    const image = new Image();

    // 解决跨域图片无法下载问题
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      const filename = new URL(url).pathname.split('/').pop() ?? `${Date.now()}.jpg`; // 有可能无法获取正确的图片名
      a.download = decodeURIComponent(filename);
      a.href = dataUrl;
      a.click();
    };
    image.src = url;
  }
};

const ToolBar: React.FC<{
  onClickClose: () => void;
  currentImage: string;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}> = (props) => {
  const { onClickClose, currentImage, onRotateLeft, onRotateRight, onZoomIn, onZoomOut } = props;
  return (
    <div className={styles.toolBar}>
      <Space size={40}>
        <DownloadOutlined
          className={styles.icon}
          onClick={() => downloadImage(currentImage)}
        />
        <RotateLeftOutlined
          className={styles.icon}
          onClick={onRotateLeft}
        />
        <RotateRightOutlined
          className={styles.icon}
          onClick={onRotateRight}
        />
        <ZoomOutOutlined
          className={styles.icon}
          onClick={onZoomIn}
        />
        <ZoomInOutlined
          className={styles.icon}
          onClick={onZoomOut}
        />
        <CloseOutlined
          className={styles.icon}
          onClick={onClickClose}
        />
      </Space>
    </div>
  );
};

const MainImage: React.FC<{
  currentImage: string;
  onNext: () => void;
  onPrev: () => void;
  imgStyle: React.CSSProperties;
  onMouseDown: React.MouseEventHandler<HTMLImageElement>;
  moving: boolean;
}> = (props) => {
  const { currentImage, onNext, onPrev, imgStyle, onMouseDown, moving } = props;
  return (
    <div className={styles.mainImageWrapper}>
      <LeftOutlined
        className={styles.arrow}
        onClick={onPrev}
      />
      <div
        className={cx(styles.mainImage, { [styles.moving]: moving })}
      >
        <img
          onMouseDown={onMouseDown}
          src={currentImage}
          style={{
            objectFit: 'contain',
            ...imgStyle,
          }}
        />
      </div>
      <RightOutlined
        className={styles.arrow}
        onClick={onNext}
      />
    </div>
  );
};

const ImageList: React.FC<{
  images: ImagePreviewModalProps['images'];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}> = (props) => {
  const { images, currentIndex, onPrev, onNext, setIndex } = props;
  return (
    <div className={styles.imageListWrapper}>
      <div
        className={styles.arrowWrapper}
        onClick={onPrev}
      >
        <LeftOutlined className={styles.icon}/>
      </div>
      <Space
        className={styles.imageList}
        size={12}
      >
        {
          images.map((url, index) => {
            return (
              <div
                className={cx(styles.imageWrapper, { [styles.active]: currentIndex === index })}
                id={`egenie-preview-${index}`}
                // eslint-disable-next-line react/no-array-index-key
                key={`${url}-${index}`}
                onClick={() => setIndex(index)}
              >
                <EgenieImage
                  className={styles.image}
                  height="auto"
                  preview={false}
                  src={url}
                  width="auto"
                />
              </div>
            );
          })
        }
      </Space>
      <div
        className={styles.arrowWrapper}
        onClick={onNext}
      >
        <RightOutlined className={styles.icon}/>
      </div>
    </div>
  );
};

export const ImagePreviewModal = (props: ImagePreviewModalProps) => {
  const { visible, images, current = 0, style, onCancel, zIndex } = props;

  const [
    index,
    setIndex,
  ] = useState(current);

  const [
    moving,
    setMoving,
  ] = useState(false);

  // 记录图片移动的位置
  const mouseDownPositionRef = useRef({
    x: 0,
    y: 0,
  });

  const currenImage = images[index];

  const { transform, updateTransform, resetTransform } = useTransform();

  const onClose = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
    resetTransform();
  };

  const onPrev = () => {
    let nextIndex = index - 1;
    if (nextIndex < 0) {
      nextIndex = images.length + nextIndex;
    }
    setIndex(nextIndex % images.length);
  };

  const onNext = () => {
    setIndex((index + 1) % images.length);
  };

  const onRotateLeft = () => {
    updateTransform({ rotate: transform.rotate - 90 });
  };

  const onRotateRight = () => {
    updateTransform({ rotate: transform.rotate + 90 });
  };

  const onZoomIn = () => {
    const newScale = transform.scale - 0.2;
    if (newScale >= 0.2) {
      updateTransform({ scale: newScale });
    }
  };

  const onZoomOut = () => {
    const newScale = transform.scale + 0.2;
    if (newScale <= 3.2) {
      updateTransform({ scale: newScale });
    }
  };

  const onMouseDown: React.MouseEventHandler<HTMLImageElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMoving(true);
    mouseDownPositionRef.current = {
      x: event.pageX - transform.x,
      y: event.pageY - transform.y,
    };
  };

  const onMouseUp = () => {
    setMoving(false);
  };

  const onMouseMove = (event: MouseEvent) => {
    if (visible && moving) {
      updateTransform({
        x: event.pageX - mouseDownPositionRef.current.x,
        y: event.pageY - mouseDownPositionRef.current.y,
      });
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (visible && event.code === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (typeof current === 'number') {
      setIndex(current);
    }
  }, [
    current,
    visible,
  ]);

  useEffect(() => {
    // 让图片滚动到可视区域
    const dom = document.querySelector(`#egenie-preview-${index}`);
    dom?.scrollIntoView({ behavior: 'smooth' });
    resetTransform();
  }, [index]);

  // 关闭页面滚动
  useEffect(() => {
    if (visible) {
      document.querySelector('html').style.overflow = 'hidden';
    } else {
      document.querySelector('html').style.overflow = 'visible';
    }
  }, [visible]);

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('mousemove', onMouseMove, false);
    return () => {
      window.removeEventListener('mouseup', onMouseUp, false);
      window.removeEventListener('mousemove', onMouseMove, false);
    };
  }, [
    visible,
    moving,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, false);
    return () => {
      window.removeEventListener('keydown', onKeyDown, false);
    };
  }, [visible]);

  // createPortal解决在表格中渲染异常的问题
  return ReactDom.createPortal((
    <div
      className={styles.mask}
      style={{
        display: visible ? 'block' : 'none',
        zIndex,
        ...style,
      }}
    >
      <div className={styles.content}>
        <MainImage
          currentImage={currenImage}
          imgStyle={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotate}deg) scale(${transform.scale})` }}
          moving={moving}
          onMouseDown={onMouseDown}
          onNext={onNext}
          onPrev={onPrev}
        />
        <ImageList
          currentIndex={index}
          images={images}
          onNext={onNext}
          onPrev={onPrev}
          setIndex={setIndex}
        />
      </div>
      <ToolBar
        currentImage={currenImage}
        onClickClose={onClose}
        onRotateLeft={onRotateLeft}
        onRotateRight={onRotateRight}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />
    </div>
  ), document.body);
};
