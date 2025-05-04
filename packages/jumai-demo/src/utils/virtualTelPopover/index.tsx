import { Alert, Popover } from 'antd';
import React from 'react';
import styles from './index.less';

export const VirtualTelPopover = () => {
  const content = (
    <div className={styles.virtualTelPopover}>
      <div className={styles.title}>
        <Alert
          message={(
            <span>
              当前收件人手机为虚拟号
              <a
                onClick={() => {
                  window.open('https://huodong.taobao.com/wow/z/mt/default/HmZpDk4CTanZyJKDeEps?spm=a219a.15212433.0.0.260d669ayrfU5v');
                }}
              >
                了解虚拟号
              </a>
            </span>
          )}
          showIcon
          type="info"
        />
      </div>
      <ul className={styles.content}>
        <li>
          虚拟号支持直接拨打，可先拨打虚拟号11位主机号，并根据提示音输入4位分机号，成功输入分机号后可以联系到收货人，如遇忙音可重新拨打。
        </li>
        <li>
          虚拟号不支持直接发短信。
        </li>
        <li>
          使用淘宝网&amp;天猫电子面单(原菜鸟电子面单)，会将虚拟号(主号+分机号)完整呈现在电子面单上，并透出“智能号码”标识。
        </li>
        <li>
          虚拟号有时间限制，发货场景下首次解密30天后失效。
        </li>
      </ul>
    </div>
  );
  return (
    <Popover
      content={content}
      title="虚拟号"
    >
      <div className={styles.virtualTel}>
        虚拟号
      </div>
    </Popover>
  );
};
