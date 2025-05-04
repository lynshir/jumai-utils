import { Col, Row } from 'antd';
import { nanoid } from 'nanoid';
import React from 'react';
import ReactDOM from 'react-dom';
// import noPic from '../../source/img/noPic.png';
import styles from './index.less';

function showSku(skuEle, saleOrderTableSkuVoList) {
  if (!document.getElementById('skuContainer')) {
    const picDiv = document.createElement('div');
    document.body.appendChild(picDiv);
    picDiv.id = 'skuContainer';
    ReactDOM.render(
      <SkuComponent
        saleOrderTableSkuVoList={saleOrderTableSkuVoList}
      />,
      document.getElementById('skuContainer')
    );
  }

  const skuRect = skuEle.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;

  // 暂不考虑水平方向空间不够的问题
  const x = skuRect.left;

  // 正常情况放图片底部,空间不够放顶部
  const y = viewHeight - skuRect.bottom < 200 ? skuRect.top - (document.getElementById('skuComponentContainer').offsetHeight * saleOrderTableSkuVoList.length) - 2 : skuRect.bottom + 2;
  const skuStyle = document.getElementById('skuContainer').style;
  skuStyle.display = 'block';
  skuStyle.border = '0px';
  skuStyle.position = 'absolute';
  skuStyle.left = `${x}px`;
  skuStyle.top = `${y}px`;
  skuStyle.zIndex = '99999';
  skuStyle.boxShadow = '0px 0px 16px 0px rgba(0, 0, 0, 0.2)';
  skuStyle.background = 'white';
  skuStyle.padding = '8px';
  skuStyle.width = saleOrderTableSkuVoList.length > 1 ? '710px' : '350px';
}

// 隐藏pic
function hideSku() {
  const skuContainer = document.getElementById('skuContainer');
  skuContainer.remove();
}

const SkuComponent = (props) => {
  const { saleOrderTableSkuVoList } = props;
  return (
    <Row>
      {saleOrderTableSkuVoList.map((item) => (
        <Col
          className={styles.skuComponentContainer}
          id="skuComponentContainer"
          key={nanoid()}
          span={saleOrderTableSkuVoList.length > 1 ? 12 : 24}
        >
          <img
            alt=""
            className={styles.displayImg}
            // src={item.pic || noPic}
          />
          <p className={styles.skuNoBox}>
            <span className={styles.skuNo}>
              {item.skuNo}
            </span>
            <span>
              ×
              {' '}
              <span className={styles.skuNumber}>
                {item.itemNum}
              </span>
            </span>
          </p>
        </Col>
      ))}
    </Row>
  );
};

export const SkuWithInfoFormatter = function({ productDisplay, info, saleOrderTableSkuVoList }): JSX.Element {
  return (
    <div
      className={styles.skuContainer}
      onMouseLeave={hideSku}
      onMouseOver={(e) => showSku(e.currentTarget, saleOrderTableSkuVoList)}
    >
      {
        productDisplay.split(',').includes('image') && (
          <img
            alt=""
            className={styles.displayImg}
            // src={info.pic || noPic}
          />
        )
      }
      <p className={styles.skuNoBox}>
        <span className={styles.skuNo}>
          {info.skuNo}
        </span>
        <span>
          ×
          {' '}
          <span className={styles.skuNumber}>
            {info.itemNum}
          </span>
        </span>
      </p>
    </div>
  );
};
