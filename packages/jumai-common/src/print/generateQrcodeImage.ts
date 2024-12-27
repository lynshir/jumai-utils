export interface GenerateQrcodeImageParams {
  content: string;
  width: number;

  /**
   * 图片涉及跨域处理,如果输入的链接,服务器必须设置跨域的相关信息
   * 传入base64的地址不会有问题
   */
  logoSrc: string;

  // 小于1会按照二维码宽度乘以此比率,大于1直接取此值
  logoWidth?: number;

  // 小于1会按照二维码高度乘以此比率,大于1直接取此值
  logoHeight?: number;
}

export async function generateQrcodeImage({
  content,
  logoSrc,
  width,
  logoWidth = 0.1,
  logoHeight = 0.1,
}: GenerateQrcodeImageParams) {
  const realLogoWidth = logoWidth <= 1 ? width * logoWidth : logoWidth;
  const realLogoHeight = logoHeight <= 1 ? width * logoHeight : logoHeight;

  const { default: qrcode } = await import('qrcode');
  const canvas: HTMLCanvasElement = await qrcode.toCanvas(content, { width });
  const context = canvas.getContext('2d');

  const logoImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image: HTMLImageElement = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = logoSrc;
    image.onload = function() {
      resolve(image);
    };
    image.onerror = function() {
      reject();
    };
  });

  context.drawImage(logoImage, (width - realLogoWidth) / 2, (width - realLogoHeight) / 2, realLogoWidth, realLogoHeight);
  return canvas.toDataURL('image/png');
}

