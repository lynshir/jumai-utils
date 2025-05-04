import { message, Modal } from 'antd';
import { getStaticResourceUrl } from 'jumai-common';

export function copyMethods(text: string) {
  const temp = document.createElement('input');
  document.body.appendChild(temp);
  temp.setAttribute('value', text);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  message.success('复制成功');
}

export function addTwoNumbers(n1: number, n2: number): number {
  return (n1 * 100 + n2 * 100) / 100;
}
export const INNER_EMPTY_STATUS = {
  notEmpty: {
    value: 'SEARCH_FOR_IS_NOT_NULL',
    label: '非空',
  },
  isEmpty: {
    value: 'SEARCH_FOR_IS_NULL',
    label: '为空',
  },
};

export const mapOptions = (data: [], key, value) => {
  return Array.isArray(data) ? data.map((item) => ({
    label: item[value],
    value: item[key],
  })) : [];
};

export const getPrice = (price, discountPrice, activityPrice) => {
  const discountPriceTmp = discountPrice && `${discountPrice}`;
  const _discountPrice = discountPriceTmp && discountPriceTmp.replace(/,/g, '');// (discountPrice && discountPrice.replace) ? discountPrice.replace(/,/g, '') : discountPrice;
  if (price && _discountPrice && activityPrice) {
    return Math.min(Number(price), Number(_discountPrice), Number(activityPrice));
  }
  if (_discountPrice && activityPrice) {
    return Math.min(Number(_discountPrice), Number(activityPrice));
  }
  return activityPrice || Number(_discountPrice) || price;
};

export const PUBLIC_IMG_URL = getStaticResourceUrl('pc/ts/jumai-ts-oms/images/');

/**
 * 同步确认框
 */
export function syncConfirm(params: {
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
}) {
  const { title, content, okText, cancelText } = params;
  return new Promise<void>((resolve, reject) => {
    Modal.confirm({
      title,
      content,
      okText,
      cancelText,
      onOk: () => resolve(),
      onCancel: () => reject('user reject'),
    });
  });
}

