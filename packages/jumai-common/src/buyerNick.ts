import { getStaticResourceUrl } from 'jumai-base';

interface ParamsInterface {
  buyerNick: string;
  shopName: string;
  platformOrderCode: string;
  userId: number;
}

function getAppRedirectUrl(platformType: number, params?: Partial<ParamsInterface>): { href: string; icon: string; } {
  let href = '';
  let icon = '';
  if (params.platformOrderCode && params.platformOrderCode.split(',').length > 1) {
    params.platformOrderCode = params.platformOrderCode.split(',')[0];
  }
  if (params.platformOrderCode) {
    params.platformOrderCode = params.platformOrderCode?.split('-AF')[0]?.split('-S')[0];
  }

  switch (platformType) {
    case 21: {
      // 抖音
      href = `https://im.jinritemai.com/pc_seller_v2/main/workspace?fromOrder=${String(params.platformOrderCode)
        .replace(/([a,A])/g, '')}`;
      icon = getStaticResourceUrl('customer-source/nickNameImg/fg.png');

      break;
    }
    case 17: {
      // 拼多多
      href = `https://mms.pinduoduo.com/chat-merchant/index.html?orderSn=${params.platformOrderCode}`;
      icon = getStaticResourceUrl('customer-source/nickNameImg/pdd.png');
      break;
    }
    case 22: {
      // 快手
      href = `https://im.kwaixiaodian.com/pc#ud=${params.userId}&type=order&td=${params.platformOrderCode}&from=sellerOrder`;
      icon = getStaticResourceUrl('customer-source/nickNameImg/ks.png');
      break;
    }

    // case 2: {
    //   // 京东
    //   href = `https://localhost.jdjingmai.com:27353/?type=startClient&param=${Base64.encode(`JDWorkStation://jm/?command=openDD&pin=${params.shopName}&client=${params.buyerNick}`)}&callback=jsonp1590740259661&v=2188`;
    //   icon = 'https://img.alicdn.com/tps/i4/T1Rsz7FPJaXXbZhKn7-520-240.gif';
    //   break;
    // }
  }
  return {
    href,
    icon,
  };
}

export { getAppRedirectUrl };
