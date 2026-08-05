export { priceReg, formatNumber, add, subtract, multiple, toFixed, formatPrice, thousandthSeparator, objToDict, mapOptions, getStaticResourceUrl, combinePath, passwordReg, phoneReg, emailReg } from 'jumai-base';
export type { DictData } from 'jumai-base';
export * from './history';
export * from './image';
export * from './importModal';
export * from './locale';
export * from './print';
export * from './renderByCondition';
export * from './renderModal';
export * from './renderRoutes';
export * from './request';
export * from './theme';
export * from './voice';
export * from './buyerNick';
export * from './permission';
export * from './upload';
// export * from './uploadPresigned';
export * from './slideVerify';

export interface Egenie {
  openTab: (url: string, tabId: number | string, tabName: string, icon?: string) => void;
  openTabId: (id: number, params?: string) => void;
  closeTab: (tabId: number | string) => void;
  toggleVersion: (resourceId: number | string, versionType: 1 | 2, params?: string) => Promise<void>;
  activeTabKey: string | number;
  beforeCloseDict?: Record<string, () => unknown>;
}

export interface JsonReader {
  root: string;
  page: string;
  total: string;
  records: string;
  repeatitems: boolean;
}

export interface Permission {
  checkPermit: (iframe: any, iframeId?: any) => void;
  permissionList: string[];
  getResourceId: (iframe: any, iframeId?: any) => number | string;
  hasPermit: (iframe: any, permission: number | string) => boolean;
}

export interface User {
  tenantType: string;
  name: string;
  tenantId: number;
  mobile: string;
  admin: true;
  id: number;
  pic: string;
  businessType: number;
  tenantIdMD5: string;
  username: string;
}

declare global {
  interface Window {
    user: User;
    jsonReader: JsonReader;

    // @ts-ignore
    egenie: Egenie;

    // @ts-ignore
    EgeniePermission: Permission;
  }
}
