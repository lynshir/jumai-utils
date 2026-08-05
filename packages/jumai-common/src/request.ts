import { message } from 'antd';
import type { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';

/**
 * 将请求单例导出去(如果有自定义的需求就自己加)
 */
export const requestSingleton: { getInstance: (options?: AxiosRequestConfig) => AxiosInstance; } = (function() {
  let instance: AxiosInstance;

  function init(options?: AxiosRequestConfig): AxiosInstance {
    const axiosInstance: AxiosInstance = axios.create({
      timeout: 1000 * 60 * 10,
      timeoutErrorMessage: '请求超时',
      withCredentials: true,

      // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
      responseType: 'json',
      ...options,
    });

    axiosInstance
      .interceptors
      .request
      .use((config) => {
        const baseHeader: {[key: string]: number | string; } = {};

        if (process.env.REACT_APP_API_VERSION) {
          baseHeader['Api-Version'] = process.env.REACT_APP_API_VERSION;
        }

        config.headers = {
          ...baseHeader,
          ...config.headers,
        };
        return config;
      }, (error: AxiosError) => {
        message.error(error?.message ?? '请求失败');
        return Promise.reject(error);
      });

    axiosInstance
      .interceptors
      .response
      .use(undefined, (error: AxiosError) => {
        message.error(error?.message ?? '请求失败');
        return Promise.reject(error);
      });

    axiosInstance
      .interceptors
      .response
      .use(responseBaseInterceptors, undefined);

    function responseBaseInterceptors(info: AxiosResponse) {
      const successfulTag = [
        'RESULT',
        'Successful',
      ];
      if (info.data && Object.prototype.hasOwnProperty.call(info.data, 'status')) {
        if (successfulTag.includes(info.data.status)) {
          return Promise.resolve(info);
        } else if (info.data.status === 'Unauthenticated' || info.data.status === 'redirected') {
          message.error({
            key: '未登录，请重新登录',
            content: '未登录，请重新登录',
          });
          if (process.env.NODE_ENV === 'production') {
            if (typeof top !== 'undefined') {
              if(top.location.href.includes('/jumai-erp-home/ysHome')){
                top.location.href = 'https://www.cjysl.com/jumai-ts-vogue/login'
              } else {
                top.location.href = info.data.data || '/login';
              }
            } else {
              window.location.href = info.data.data || '/login';
            }
          }
          return Promise.reject(info);
        } else {
          const errorMsg = String(info.data.info || info.data.data || '请求失败');
          message.error({
            key: errorMsg,
            content: errorMsg,
          });
          return Promise.reject(info);
        }
      } else {
        return Promise.resolve(info);
      }
    }

    return axiosInstance;
  }

  return {
    getInstance(options?: AxiosRequestConfig): AxiosInstance {
      if (instance) {
        return instance;
      } else {
        instance = init(options);
        return instance;
      }
    },
  };
}());

/**
 * 如果返回满足以status或者success字段区分成功，不需要再手动判断请求是否成功，和给出错误提示
 * 对axios的封装。https://github.com/axios/axios
 * @param options axios配置
 */
export function request<T = unknown>(options: AxiosRequestConfig = {}): Promise<T> {
  // 错误情况还需要处理的请自行处理。这里无法处理
  return requestSingleton.getInstance()
    .request<T>(options)
    .then((info) => info.data);
}

/**
 * 常见的后端数据返回结构。以泛型传递给request
 */
export interface BaseData<T = unknown> {
  status?: string;
  info?: string;
  data: T;
}

/**
 * 常见的后端分页的数据返回结构。以泛型传递给request
 */
export interface PaginationData<T = unknown> {
  status?: string;
  info?: string;
  success?: boolean;
  errorMsg?: string;
  errorCode?: number;
  data?: PureData<T>;
}

/**
 * 批量报告的数据返回结构。以泛型传递给request
 */
export interface BatchReportData<T = unknown> {
  status: string;
  info: string;
  data: {
    total: number;
    successedList: T[];
    successed: number;
    operationName: string;
    failed: number;
    list?: T[];
    failedList?: T[];
  };
}

/**
 * 后端直接返回data对象
 */
export interface PureData<T = unknown> {
  calTotalPageCount: number;
  first: number;
  list: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPageCount: number;
}
