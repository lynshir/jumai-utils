import React from 'react';
import { getStaticResourceUrl } from 'jumai-base';

const imgId = '__EGENIE_IMAGE_DEFAULT_ID__';
const imgPreviewOffsetDistance = 20;

function initElementIfNotFind(width: number, height: number): HTMLImageElement {
  let imgElement = document.getElementById(imgId) as HTMLImageElement;

  if (!imgElement) {
    imgElement = document.createElement('img');
    imgElement.style.display = 'none';
    imgElement.style.objectFit = 'contain';
    imgElement.style.width = `${width}px`;
    imgElement.style.height = `${height}px`;
    imgElement.id = imgId;
    imgElement.style.border = 'none';
    imgElement.style.position = 'absolute';
    imgElement.style.zIndex = '99999999';
    document.body.appendChild(imgElement);
  }

  return imgElement;
}

function getAppropriateClientCoordinates(clientX: number, clientY: number, previewWidth: number, previewHeight: number): { x: number; y: number; } {
  let x = clientX;
  let y = clientY;
  const clientWidth = document.documentElement.clientWidth;
  const clientHeight = document.documentElement.clientHeight;
  if (previewWidth + imgPreviewOffsetDistance <= clientWidth) {
    if (x + previewWidth + imgPreviewOffsetDistance <= clientWidth) {
      x += imgPreviewOffsetDistance;
    } else {
      x = Math.max(x - imgPreviewOffsetDistance - previewWidth, 0);
    }
  } else {
    x += imgPreviewOffsetDistance;
  }

  if (previewHeight + imgPreviewOffsetDistance <= clientHeight) {
    if (y + previewHeight + imgPreviewOffsetDistance <= clientHeight) {
      y += imgPreviewOffsetDistance;
    } else {
      y = Math.max(y - imgPreviewOffsetDistance - previewHeight, 0);
    }
  } else {
    y += imgPreviewOffsetDistance;
  }

  return {
    x,
    y,
  };
}

function updatePreviewPosition(imgElement: HTMLImageElement, imgSrc: string, previewWidth: number, previewHeight: number, x: number, y: number): void {
  imgElement.src = imgSrc;
  imgElement.style.width = `${previewWidth}px`;
  imgElement.style.height = `${previewHeight}px`;
  imgElement.style.display = 'block';
  imgElement.style.left = `${x}px`;
  imgElement.style.top = `${y}px`;
}

function showPic(event: any) {
  const imgSrc = event.target.src;
  const previewWidth = Number(event.target.dataset.previewWidth) || 0;
  const previewHeight = Number(event.target.dataset.previewHeight) || 0;
  const imgElement = initElementIfNotFind(previewWidth, previewHeight);

  const {
    x,
    y,
  } = getAppropriateClientCoordinates(event.clientX, event.clientY, previewWidth, previewHeight);

  updatePreviewPosition(imgElement, imgSrc, previewWidth, previewHeight, x + window.pageXOffset, y + window.pageYOffset);
}

function hidePic() {
  const imgElement = document.getElementById(imgId);
  if (imgElement) {
    imgElement.style.display = 'none';
  }
}

type ImgElementProps = JSX.IntrinsicElements['img'];

export interface ImageProps extends ImgElementProps {

  /**
   * 图片src
   */
  src?: string;

  /**
   * 图片默认src(默认https://front.ejingling.cn/customer-source/noPic.png)
   */
  defaultSrc?: string;

  /**
   * 图片显示宽度(默认32)
   */
  width?: number | string;

  /**
   * 图片显示高度(默认32)
   */
  height?: number | string;

  /**
   * 是否支持预览
   */
  preview?: boolean;

  /**
   * 图片预览显示宽度(默认320)
   */
  previewWidth?: number;

  /**
   * 图片预览显示高度(默认320)
   */
  previewHeight?: number;

  /**
   * 图片预览显示高度(默认向右向下20)
   */
  previewOffsetDistance?: number;
}

const isSupportLoading = 'loading' in HTMLImageElement.prototype;
const isSupportIntersectionObserver = typeof IntersectionObserver !== 'undefined';

export const Image: React.FC<ImageProps> = function({
  src,
  defaultSrc = getStaticResourceUrl('customer-source/noPic.png'),
  className = '',
  style,
  width = 32,
  height = 32,
  previewWidth = 320,
  previewHeight = 320,
  previewOffsetDistance = 20,
  preview = true,
  alt,
  ...rest
}) {
  const imgRef = React.useRef<HTMLImageElement>();
  const intersectionObserverRef = React.useRef<IntersectionObserver>();
  const hasSrc = Boolean(src);

  React.useLayoutEffect(() => {
    if (hasSrc) {
      if (isSupportLoading) {
        // 不需要做任何事
      } else if (isSupportIntersectionObserver) {
        if (!intersectionObserverRef.current) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0) {
                imgRef.current.src = src;
              }
            });
          });
          observer.observe(imgRef.current);
          intersectionObserverRef.current = observer;
        } else {
          intersectionObserverRef.current.observe(imgRef.current);
        }
      } else {
        imgRef.current.src = src;
      }
    }

    return () => intersectionObserverRef?.current?.unobserve(imgRef.current);
  }, [src]);

  return (
    <img
      alt={alt}
      className={className}
      data-preview-height={previewHeight}
      data-preview-width={previewWidth}
      height={height}
      loading="lazy"
      onMouseMove={hasSrc && preview ? showPic : undefined}
      onMouseOut={hasSrc && preview ? hidePic : undefined}
      ref={imgRef}
      src={isSupportLoading && hasSrc ? src : defaultSrc}
      style={{
        objectFit: 'contain',
        border: 'none',
        ...style,
      }}
      width={width}
      {...rest}
    />
  );
};

