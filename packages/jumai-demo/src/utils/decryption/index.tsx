import { ExclamationCircleFilled } from '@ant-design/icons';
import { message, Modal, Popover } from 'antd';
import axios from 'axios';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import React from 'react';
import styles from './index.less';

const ORDER_ADDRESS = 'https://fw.jd.com/main/detail/FW_GOODS-1415001';
const JD_APP_KEY = {
  JDC_664C9667E23A8A0A5D24A3D849EE: '920',
  '4A7DD276D1A709CB16AF06DE925B8BF7': '11211',
};
interface PlaintextInterface {
  receiverDistrict: string;
  receiverPhone: string;
  receiverState: string;
  receiverCity: string;
  receiverTown: string;
  receiverAddress: string;
  receiverMobile: string;
  receiverName: string;
  virtualTel?: boolean;
  virtualNo?: string;
  isTaobaoVirtualTel: boolean;
}

interface SecTokenInterface {
  httpStatusCode: number | string;
  model: string;
  success: boolean | string;
  code: number;
  msg: string;
  sub_msg: string;
}

interface SignForTokenInterface {
  appKey: string;
  appName: string;
  ati: string;
  sessionId: string;
  sign: string;
  taobaoUserId: string;
  time: string;
  topAppKey: string;
  userId: string;
  userIp: string;
  method: string;
  topToken: string;
  secToken: string;
  tid: string;
  oaid: string;
}

interface DataByBXInterface {
  receiver_list: Array<{
    address_detail: string;
    city: string;
    district: string;
    mobile: string;
    name: string;
  }>;
  request_id: string;

}
export async function decryption(type: number, id: number, decryptionField?: string, params?: any): Promise<Partial<PlaintextInterface>> {
  let plaintextData: Partial<PlaintextInterface> = {};
  try {
    console.log(type, params, '=============================<type>');
    if (params && params.originType === 3) {
      plaintextData = await getPlaintextData(id);
    } else {
      switch (type) {
        case 1: {
          plaintextData = await tbDecryption(id, params);
          break;
        }

        // case 2: {
        //   plaintextData = await jdDecryption(id, params, decryptionField);
        //   break;
        // }

        // case 21: {
        //   plaintextData = await singleDecryption(id, decryptionField);
        //   break;
        // }
        default: {
          plaintextData = await getPlaintextData(id);
          break;
        }
      }
    }

    const rex = new RegExp(/^\d{5,}(-)/);
    if (type === 1 && plaintextData?.receiverMobile && rex?.test(plaintextData?.receiverMobile)) {
      plaintextData.isTaobaoVirtualTel = true;
    }
    if (type === 21 && Boolean(plaintextData.virtualTel) && rex?.test(plaintextData?.receiverMobile)) {
      const [
        mobile,
        turn,
      ] = plaintextData.receiverMobile.split('-');
      plaintextData.virtualNo = turn;
      plaintextData.receiverMobile = mobile;
      plaintextData.receiverAddress = `${plaintextData.receiverAddress}[${turn}]`;
      plaintextData.receiverName = `${plaintextData.receiverName}[${turn}]`;
    }

    return plaintextData;
  } catch (e) {
    console.error(e);
    message.error('解密失败');
    throw e;
  }
}

/**
 * 单个解密
 * @param id
 * @param decryptionField  解密字段必须与PlaintextInterface中的 key一致
 */
async function singleDecryption(id, decryptionField) {
  const data = await getPlaintextData(id);
  if (decryptionField) {
    return data[decryptionField] ? { [decryptionField]: data[decryptionField] } : {};
  }
  return data;
}

/**
 * 获取解密信息
 * @returns {Promise<string|void>}
 */
async function getPlaintextData(orderId): Promise<PlaintextInterface> {
  const url = '/api/oms/rest/receiver/queryOriginReceiverInfoBySaleOrderId';
  const req = await request<BaseData<PlaintextInterface>>({
    method: 'POST',
    url,
    data: { id: orderId },
  });
  return req.data;
}

/**
 * 京东解密
 */
async function jdDecryption(id: number, params: any, decryptionField: string): Promise<any> {
  try {
    const tokenReq = await request<BaseData<{[key: number]: string; }>>({
      method: 'POST',
      url: '/api/baseinfo/rest/shop/getToken',
      data: { ids: '2' },
    });
    const appKeyReq = await request<BaseData<string>>({
      method: 'POST',
      url: '/api/baseinfo/rest/shop/getJdOutsideAppKey',
      data: { id: params.shopId },
    });
    const token = tokenReq.data[params.shopId];
    const timestamp = new Date().getTime();
    const dateStr = new Date(timestamp).toISOString()
      .replace(/\.\d{3}Z$/, 'Z')
      .replace(/[:-]|\.\d{3}/g, '');
    const header = {
      'content-type': 'application/json',
      'x-jdcloud-date': dateStr,
      'x-jdcloud-nonce': 'ed558a3b-9808-4edb-8597-187bda63a4f2',
    };
    const result = await request<{ auth: string;uuid: string; }>({
      method: 'POST',
      url: `/jdhufu/order/user?app_key=${appKeyReq.data}&customerId=${JD_APP_KEY[appKeyReq.data]}&method=jingdong.hufu.order.getSensitiveData`,
      data: {
        orders_nos: params.platformOrderCode,
        token,
        timestamp,
        extendProps: !decryptionField || decryptionField === 'receiverMobile' ? { decryptMobile: true } : null,
      },
      headers: header,
    });

    let decryptData: any = await axios.request<{ code: string; orderSensitiveInfo: { num: number; orderList: Array<{ receiverMobile: number; receiverTelephone: number; receiverName: string; receiverAddress: string; }>; }; }>({
      method: 'POST',
      url: `https://hufu.cn-north-1.jdcloud-api.net/order/getSensitiveData?app_key=${appKeyReq.data}&customerId=${JD_APP_KEY[appKeyReq.data]}&method=jingdong.hufu.order.getSensitiveData`,
      data: {
        orders_nos: params.platformOrderCode,
        token,
        ...(!decryptionField || decryptionField === 'receiverMobile' ? { extendProps: { decryptMobile: true }} : {}),
      },
      withCredentials: false,
      headers: {
        'content-type': 'application/json',
        'x-jdcloud-date': dateStr,
        'x-jdcloud-nonce': result.uuid,
        authorization: result.auth,
      },
    });
    decryptData = decryptData.data;
    console.log(decryptData, '=======<>');

    let data: any = {};
    if (decryptData.code === '406') {
      Modal.error({
        title: '错误',
        content: (
          <div>
            京东平台隐私号余额不足，请前往平台订购，订购地址：
            <a
              href={ORDER_ADDRESS}
              rel="noreferrer"
              target="_blank"
            >
              { ORDER_ADDRESS }
            </a>
          </div>),
      });
    }
    if (decryptData?.orderSensitiveInfo?.orderList && decryptData?.orderSensitiveInfo?.orderList.length) {
      const { receiverAddress, receiverName, receiverTelephone, receiverMobile } = decryptData?.orderSensitiveInfo.orderList[0];
      data = {
        receiverAddress,
        receiverName,
        receiverPhone: receiverTelephone,
        receiverMobile,
      };
      if (decryptionField && decryptionField !== 'receiverMobile') {
        delete data.receiverMobile;
      }
    }

    return data;
  } catch (e) {
    message.error('京东解密失败');
    console.error('解密失败', e);
  }
}

/**
 * 淘宝解密获取SecToken
 */
async function getSecToken(params?: Partial<SignForTokenInterface>): Promise<string> {
  // @ts-ignore
  const secToken: Partial<SecTokenInterface> = await window?.secToken?.getSecTokenByBX({
    params: {
      ...params,
      oaid: undefined,

      tid: undefined,
    },
    headers: { 'Content-Type': 'Application/x-www-form-urlencoded' },
  });
  console.log(secToken, '=======<>');
  if (secToken.httpStatusCode !== 200) {
    throw secToken;
  }
  return secToken.model;
}

/**
 * 淘宝解密获取topToken
 * @param token secToken
 */
async function getTopDataByBX(params: Partial<SignForTokenInterface>, oaid: string, tid: string) {
  // @ts-ignore
  const topToken: { error_response: Partial<SecTokenInterface>; } & Partial<DataByBXInterface> = await window?.secToken?.getTopDataByBX({
    params: {
      ...params,
      oaid: undefined,
      tid: undefined,
    },
    headers: { 'Content-Type': 'Application/x-www-form-urlencoded' },
    data: `query_list={"tid":"${tid}","oaid":"${oaid}","scene":"1005","secret_no_days":30}`,
  });
  console.log(topToken, '====<>');

  if (topToken?.error_response?.sub_msg) {
    throw topToken.error_response;
  }
  return topToken;
}

/**
 * 淘宝解密
 */
async function tbDecryption(id: number, params: any) {
  let plaintextData: Partial<PlaintextInterface> = {};
  try {
    const req = await request<BaseData<Partial<SignForTokenInterface>>>({ url: `/api/saleorder/rest/receiver/getSignForSecToken/taobao?saleOrderId=${id}` });
    if (req.data.oaid) {
      const secToken = await getSecToken(req.data);

      const topTokenReq = await request<BaseData<Partial<SignForTokenInterface>>>({
        url: '/api/saleorder/rest/receiver/getTopTokenForDecrypt/taobao',
        method: 'POST',
        data: {
          shopId: params.shopId,
          secToken,
        },
      });
      const data = await getTopDataByBX(topTokenReq.data, req.data.oaid, req.data.tid);
      if (data?.receiver_list?.length) {
        const {
          address_detail,
          name,
          mobile,
        } = data.receiver_list[0];
        plaintextData = {
          receiverMobile: mobile,
          receiverAddress: address_detail,
          receiverName: name,
        };
      }
    } else {
      plaintextData = await getPlaintextData(id);
    }
    return plaintextData;
  } catch (e) {
    if (e.sub_msg) {
      message.error(e.sub_msg);
    }
    throw e;
  }
}

export class BalloonTooltips extends React.Component<{ receiverDistrict?: string; receiverState?: string; receiverCity?: string; virtualNo?: string; receiverAddress?: string;receiverMobile?: string;receiverName?: string; }> {
  render() {
    const { virtualNo, receiverState, receiverDistrict, receiverCity } = this.props;
    return (
      <Popover
        content={(
          <div className={styles.body}>
            <ExclamationCircleFilled className={styles.icon}/>
            <div className={styles.describe}>
              <span className={styles.describeTitle}>
                请使用虚拟号联系买家/发货，以保证买家信息安全
              </span>
              <div className={styles.describeBody}>
                <div className={styles.sign}/>
                <div className={styles.describePrompt}>
                  <span className={styles.prompt}>
                    此号码为虚拟号，如需联系买家，可直接拨打号码，听到语音提示后，输入姓名后4位分机号码
                    <span>
                      （虚拟号不得复制用于发货，如需消费者真实手机号，需至商家后台报备获取）
                    </span>
                  </span>
                  <div className={styles.buyersInformation}>
                    <span>
                      买家信息：
                    </span>
                    <div>
                      <span>
                        {this.props.receiverName?.replace(`[${virtualNo}]`, '')}
                        <span className={styles.virtualNo}>
                          [
                          {this.props.virtualNo}
                          ]
                        </span>
                      </span>
                      <span>
                        {this.props.receiverMobile}
                      </span>
                      {/* <Tooltip title={`${this.props.receiverAddress}[${this.props.virtualNo}]`}>*/}
                      <span className={styles.receiverAddress}>
                        {(receiverState || '') + (receiverCity || '') + (receiverDistrict || '') + this.props.receiverAddress?.replace(`[${virtualNo}]`, '')}
                        <span className={styles.virtualNo}>
                          [
                          {this.props.virtualNo}
                          ]
                        </span>
                      </span>
                      {/* </Tooltip>*/}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        defaultVisible
      >
        {this.props.children}
      </Popover>

    );
  }
}
