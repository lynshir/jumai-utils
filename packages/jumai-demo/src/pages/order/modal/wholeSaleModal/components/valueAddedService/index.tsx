import React from 'react';
import { Checkbox, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import { observer } from 'mobx-react';

// import type WholeSaleStore from '../../store';

interface ValueAddedServiceProps{
  toggleActivationGuide?: (visible: boolean) => void;
  valueAddVos?: any[];
  closeFlag: boolean;
  toggleValueAddVos: (visible: boolean) => void;
  openSetService?: () => void;
  isQuickSale: boolean;// 是否极速代发
}

// 增值服务Tip
export const ValueAddedService: React.FC<ValueAddedServiceProps> = (props) => {
  const { toggleActivationGuide, valueAddVos, closeFlag, toggleValueAddVos, openSetService, isQuickSale } = props;
  return (
    <div className={styles.valueAddedServiceTip}>
      <div className={styles.title}>
        <div className={styles.titleLogo}>
          增值服务
        </div>
        <div className={styles.titleOther}>
          <div>
            提供换包装/换吊牌/放好评卡/放合格证/放发货单等增值服务
            {
              !isQuickSale ? (
                <a
                  className={styles.setService}
                  onClick={openSetService}
                >
                  设置服务
                </a>
              ) : null
            }
          </div>
          <Checkbox
            checked={closeFlag}
            onChange={(e) => {
              toggleValueAddVos(e.target.checked);
            }}
          >
            关闭本单增值服务
          </Checkbox>
        </div>
      </div>
      {/* 非极速代发 */}
      {
        !isQuickSale && !closeFlag ? (
          <div className={styles.valueAddedServiceContent}>
            {
              Array.isArray(valueAddVos) && valueAddVos.length > 0 ? (
                <div className={styles.valueAddVosWrapper}>
                  {valueAddVos.map((item) => (
                    <EachAddVo
                      data={item}
                      key={item.code}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.notEnabled}>
                  <div>
                    暂未开通增值服务，如需开通查看开通指南
                  </div>
                  <div>
                    <a onClick={() => {
                      toggleActivationGuide(true);
                    }}
                    >
                      开通指南
                      {' '}
                      {'>'}
                    </a>
                  </div>
                </div>
              )
            }
          </div>
        ) : null
      }
    </div>
  );
};

interface EachAddVoProps{
  serviceName: string;
  num: number;
  amount: number;
  valueAddWarehouseInfos: EachContentProps[];
}

const orderUnitList = [
  '换包装',
  '放好评卡',
  '放发货单',
];

// 单个增值服务
const EachAddVo: React.FC<{ data: EachAddVoProps; }> = (props) => {
  const { serviceName, amount, num, valueAddWarehouseInfos } = props.data;

  const unit = React.useMemo(() => {
    return orderUnitList.includes(serviceName) ? 'order' : 'sku';
  }, [serviceName]);
  return (
    <div className={styles.eachAddVo}>
      <div>
        <span className={styles.eachAddVoName}>
          {serviceName}
          <Popover
            content={(
              <PopoverContent
                data={valueAddWarehouseInfos}
                unit={unit}
              />
            )}
            placement="bottom"
            title=""
          >
            <QuestionCircleOutlined className={styles.eachAddVoTip}/>
          </Popover>
        </span>
        
      </div>
      <div className={styles.eachAddVoSecond}>
        <span>
          小计：
          <span className={styles.eachAddVoAmount}>
            ¥
            {amount}
          </span>
        </span>
        <span>
          (
          {num}
          {unit === 'order' ? '单' : '件' }
          )
        </span>
      </div>
    </div>
  );
};

interface EachContentProps{
  cloudWarehouseName: string;
  price: number;
  num: number;
}

const PopoverContent: React.FC<{ data: EachContentProps[]; unit: 'order' | 'sku'; }> = (props) => {
  return (
    <table className={styles.tipTable}>
      <tbody>
        {
          props.data.map((item) => (
            <tr
              className={styles.tipTableTr}
              key={item.cloudWarehouseName}
            >
              <td className={styles.eachTd}>
                {item.cloudWarehouseName}
              </td>
              <td className={styles.eachTd}>
                ¥
                {item.price}
                /
                {props.unit === 'order' ? '单' : '件' }
              </td>
              <td className={styles.eachTd}>
                {item.num}
                {props.unit === 'order' ? '单' : '件' }
              </td>
            </tr>

          ))
        
        }
      </tbody>
    </table>
  );
};
