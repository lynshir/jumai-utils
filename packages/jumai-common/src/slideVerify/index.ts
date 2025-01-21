/**
 * 使用示例：
 *  const slider = new SlideVerify({
          onSuccess: () => {
            console.log('验证成功');
            slider.clear(); // 清除
          },
          onFail: () => {
            console.log('验证失败');
          },
        })
 * **/
import styles from './index.module.less';
import { getStaticResourceUrl } from 'jumai-base';

const commonBackgroundUrl = getStaticResourceUrl('pc/js/static/source/img/iconlist.png');

interface IImgProps extends HTMLImageElement {
  setSrc?: (src?: string) => void;
}

interface ISlideVerify {
  el?: HTMLElement;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  parentId?: string;
  sliderText?: string;
  onSuccess?: () => void;
  onFail?: () => void;
  onRefresh?: () => void;
}

const w = 310; // canvas宽度
const h = 155; // canvas高度
const l = 42; // 滑块边长
const r = 9; // 滑块半径
const PI = Math.PI;
const L = l + r * 2 + 3; // 滑块实际边长

function getRandomNumberByRange(start, end) {
  return Math.round(Math.random() * (end - start) + start);
}

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createImg(onload) {
  const img: IImgProps = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = onload;
  img.onerror = () => {
    img.setSrc(getRandomImgSrc()); // 图片加载失败的时候重新加载其他图片
  };

  // 给img添加setSrc方法
  img.setSrc = function(src) {
    img.src = src;
  };

  img.setSrc(getRandomImgSrc());
  return img;
}

function createElement(tagName, className?: string) {
  const element = document.createElement(tagName);
  className && (element.className = className);
  return element;
}

function setClass(element, className) {
  element.className = className;
}

function addClass(element, className) {
  element.classList.add(className);
}

function removeClass(element, className) {
  element.classList.remove(className);
}

function getRandomImgSrc() {
  // return `https://picsum.photos/id/${getRandomNumberByRange(1, 14)}/${w}/${h}`

  return getStaticResourceUrl(`customer-source/verify/${getRandomNumberByRange(1, 14)}.jpg?x-oss-process=image/resize,w_${w},h_${h}/auto-orient,1/quality,q_90/format,jpg`);
}

/**
 *
 * @param {*} ctx context
 * @param {*} x
 * @param {*} y
 * @param {*} operation
 * 填充一块  剪切一块
 */
function drawPath(ctx, x, y, operation) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI);
  ctx.lineTo(x + l, y);
  ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI);
  ctx.lineTo(x + l, y + l);
  ctx.lineTo(x, y + l);
  ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true);
  ctx.lineTo(x, y);
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.stroke();
  ctx.globalCompositeOperation = 'destination-over';
  operation === 'fill' ? ctx.fill() : ctx.clip();
}

function sum(x, y) {
  return x + y;
}

function square(x) {
  return x * x;
}

export class SlideVerify {
  public el?: HTMLElement;

  public width?: number;

  public height?: number;

  public x?: number;

  public y?: number;

  public parentId?: string;

  public sliderText?: string;

  public onSuccess?: () => void;

  public onFail?: () => void;

  public onRefresh?: () => void;

  private containerDomWrapper?: HTMLElement;

  private loadingContainer?: HTMLElement;

  private sliderContainer?: HTMLElement;

  private img?: IImgProps;

  private canvasCtx?: CanvasRenderingContext2D;

  private blockCtx?: CanvasRenderingContext2D;

  private slider?: HTMLElement;

  private block?: HTMLCanvasElement;

  private refreshIcon?: HTMLElement;

  private closeIcon?: HTMLElement;

  private sliderMask?: HTMLElement;

  private text?: HTMLElement;

  private trail?: number[];

  private handleDragStart: (event?: DragEvent) => void;

  private handleDragMove: (event?: DragEvent) => void;

  private handleDragEnd: (event?: DragEvent) => void;

  constructor({
    el,
    width = w,
    height = h,
    x,
    y,
    parentId,
    sliderText,
    onSuccess,
    onFail,
    onRefresh,
  }: ISlideVerify) {
    const posLeft = window.innerWidth / 2 - width / 2;
    const posTop = window.innerHeight / 2 - height / 2;
    let containerDom: HTMLElement = el || document.getElementsByClassName(styles.slideVerifyContainer)[0] as HTMLElement;
    const containerDomWrapper = document.createElement('div');
    setClass(containerDomWrapper, styles.containerDomWrapper);

    if (!containerDom) {
      containerDom = el || document.createElement('div');
      setClass(containerDom, styles.slideVerifyContainer);
    }
    const parentEle = document.getElementById(`${parentId}`);
    parentEle ? parentEle.append(containerDomWrapper) : document.body.append(containerDomWrapper);
    containerDomWrapper.append(containerDom);
    Object.assign(containerDomWrapper.style, {
      left: `${x || posLeft}px`,
      top: `${y || posTop}px`,
      zIndex: 10000,

    });
    Object.assign(containerDom.style, {
      position: 'relative',
      margin: '0 auto',
      width: `${width}px`,

      // left: `${x || posLeft}px`,
      // top: `${y || posTop}px`,
    });
    this.sliderText = sliderText;
    this.containerDomWrapper = containerDomWrapper;
    this.el = containerDom;
    this.width = width;
    this.height = height;
    this.onSuccess = onSuccess;
    this.onFail = onFail;
    this.onRefresh = onRefresh;
    this.init();
  }

  public init(): void {
    this.initDOM();
    this.initImg();
    this.bindEvents();
  }

  public initDOM(): void {
    const {
      width,
      height,
      sliderText,
    } = this;
    const canvas = createCanvas(width, height); // 画布
    const block = createCanvas(width, height); // 滑块
    setClass(block, styles.sliderBlock);
    const sliderContainer = createElement('div', styles.sliderContainer);
    sliderContainer.style.width = `${width}px`;
    sliderContainer.style.pointerEvents = 'none';

    const title = createElement('span', ` ${styles.title}`);
    title.innerText = '验证';
    const closeIcon = createElement('span', `icon-close ${styles.closeIcon}`);

    const refreshIcon = createElement('div', styles.refreshIcon);
    refreshIcon.style.backgroundImage = `url(${commonBackgroundUrl})`;

    const sliderMask = createElement('div', styles.sliderMask);
    const slider = createElement('div', styles.slider);

    const sliderIcon = createElement('span', styles.sliderIcon);
    sliderIcon.style.backgroundImage = `url(${commonBackgroundUrl})`;

    const text = createElement('span', styles.sliderText);
    text.innerHTML = sliderText || '向右滑动填充拼图';

    // 增加loading
    const loadingContainer = createElement('div', styles.loadingContainer);
    loadingContainer.style.width = `${width}px`;
    loadingContainer.style.height = `${height}px`;

    const loadingIcon = createElement('div', styles.loadingIcon);
    loadingIcon.style.backgroundImage = `url(${commonBackgroundUrl})`;

    const loadingText = createElement('span');
    loadingText.innerHTML = '加载中...';
    loadingContainer.appendChild(loadingIcon);
    loadingContainer.appendChild(loadingText);

    const el = this.el;
    el.appendChild(loadingContainer);

    el.appendChild(title);
    el.appendChild(closeIcon);
    el.appendChild(canvas);
    el.appendChild(refreshIcon);
    el.appendChild(block);
    slider.appendChild(sliderIcon);
    sliderMask.appendChild(slider);
    sliderContainer.appendChild(sliderMask);
    sliderContainer.appendChild(text);
    el.appendChild(sliderContainer);

    Object.assign(this, {
      canvas,
      block,
      sliderContainer,
      loadingContainer,
      refreshIcon,

      title,
      closeIcon,
      slider,
      sliderMask,
      sliderIcon,
      text,
      canvasCtx: canvas.getContext('2d'),
      blockCtx: block.getContext('2d'),
    });
  }

  public setLoading(isLoading: boolean): void {
    this.loadingContainer.style.display = isLoading ? '' : 'none';
    this.sliderContainer.style.pointerEvents = isLoading ? 'none' : '';
  }

  public initImg(): void {
    const img = createImg(() => {
      this.setLoading(false);
      this.draw(img);
    });
    this.img = img;
  }

  public draw(img): void {
    const {
      width,
      height,
    } = this;

    // 随机位置创建拼图形状
    this.x = getRandomNumberByRange(L + 10, width - (L + 10));
    this.y = getRandomNumberByRange(10 + r * 2, height - (L + 10));
    drawPath(this.canvasCtx, this.x, this.y, 'fill');
    drawPath(this.blockCtx, this.x, this.y, 'clip');

    // 画入图片
    this.canvasCtx.drawImage(img, 0, 0, width, height);
    this.blockCtx.drawImage(img, 0, 0, width, height);

    // 提取滑块并放到最左边
    const y = this.y - r * 2 - 1;
    const ImageData = this.blockCtx.getImageData(this.x - 3, y, L, L);
    this.block.width = L;
    this.blockCtx.putImageData(ImageData, 0, y);
  }

  public bindEvents(): void {
    this.el.onselectstart = () => false;
    this.refreshIcon.onclick = () => {
      this.reset();
      typeof this.onRefresh === 'function' && this.onRefresh();
    };
    this.closeIcon.onclick = () => {
      this.clear();
    };

    let originX,
      originY,
      isMouseDown = false;
    const trail = [];

    const handleDragStart = function(e) {
      originX = e.clientX || e.touches[0].clientX;
      originY = e.clientY || e.touches[0].clientY;
      isMouseDown = true;
    };
    const width = this.width;
    const handleDragMove = (e) => {
      if (!isMouseDown) {
        return false;
      }
      e.preventDefault();
      const eventX = e.clientX || e.touches[0].clientX;
      const eventY = e.clientY || e.touches[0].clientY;
      const moveX = eventX - originX;
      const moveY = eventY - originY;
      if (moveX < 0 || moveX + 38 >= width) {
        return false;
      }
      this.slider.style.left = `${moveX}px`;
      const blockLeft = (width - 40 - 20) / (width - 40) * moveX;
      this.block.style.left = `${blockLeft}px`;

      addClass(this.sliderContainer, styles.sliderContainerActive);
      this.sliderMask.style.width = `${moveX}px`;
      trail.push(moveY);
      return true;
    };

    const handleDragEnd = (e) => {
      if (!isMouseDown) {
        return false;
      }
      isMouseDown = false;
      const eventX = e.clientX || e.changedTouches[0].clientX;
      if (eventX === originX) {
        return false;
      }
      removeClass(this.sliderContainer, styles.sliderContainerActive);
      this.trail = trail;
      const {
        spliced,
        verified,
      } = this.verify();
      if (spliced) {
        if (verified) {
          addClass(this.sliderContainer, styles.sliderContainerSuccess);
          typeof this.onSuccess === 'function' && this.onSuccess();
          setTimeout(() => this.clear(), 1000);
        } else {
          addClass(this.sliderContainer, styles.sliderContainerFail);
          this.text.innerHTML = '请再试一次';
          this.reset();
        }
      } else {
        addClass(this.sliderContainer, styles.sliderContainerFail);
        typeof this.onFail === 'function' && this.onFail();
        setTimeout(this.reset.bind(this), 1000);
      }
      return true;
    };
    this.slider.addEventListener('mousedown', handleDragStart);
    this.slider.addEventListener('touchstart', handleDragStart);
    this.block.addEventListener('mousedown', handleDragStart);
    this.block.addEventListener('touchstart', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  }

  public verify(): { spliced: boolean; verified: boolean; } {
    const arr = this.trail; // 拖动时y轴的移动距离
    const average = arr.reduce(sum) / arr.length;
    const deviations = arr.map((x) => x - average);

    // 标准差
    const stddev = Math.sqrt(deviations.map(square)
      .reduce(sum) / arr.length);
    // eslint-disable-next-line radix
    const left = parseInt(this.block.style.left);
    return {
      spliced: Math.abs(left - this.x) < 10,
      verified: stddev !== 0, // 简单验证拖动轨迹，为零时表示Y轴上下没有波动，可能非人为操作
    };
  }

  public reset(): void {
    const {
      width,
      height,
    } = this;

    // 重置样式
    setClass(this.sliderContainer, styles.sliderContainer);
    this.slider.style.left = `${0}px`;
    this.block.width = width;
    this.block.style.left = `${0}px`;
    this.sliderMask.style.width = `${0}px`;

    // 清空画布
    this.canvasCtx.clearRect(0, 0, width, height);
    this.blockCtx.clearRect(0, 0, width, height);

    // 重新加载图片
    this.setLoading(true);
    this.img.setSrc(getRandomImgSrc());
  }

  public clear(): void {
    const {
      handleDragStart,
      handleDragMove,
      handleDragEnd,
    } = this;
    this.el.innerHTML = '';
    removeClass(this.containerDomWrapper, styles.containerDomWrapper);
    this.trail = [];

    // @ts-ignore
    this.slider.removeEventListener('mousedown', handleDragStart);

    // @ts-ignore
    this.slider.removeEventListener('touchstart', handleDragStart);

    // @ts-ignore
    this.block.removeEventListener('mousedown', handleDragStart);

    // @ts-ignore
    this.block.removeEventListener('touchstart', handleDragStart);

    // @ts-ignore
    document.removeEventListener('mousemove', handleDragMove);

    // @ts-ignore
    document.removeEventListener('touchmove', handleDragMove);

    // @ts-ignore
    document.removeEventListener('mouseup', handleDragEnd);

    // @ts-ignore
    document.removeEventListener('touchend', handleDragEnd);
  }
}

