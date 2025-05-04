import React from 'react';
import styles from './index.less';

interface IEachMaterialComponent{
  materialType: number;
  url: string;
  belongType: number;
  materialName: string;
  weight: number;
  spec: string;
}

const EachMaterialComponent: React.FC<IEachMaterialComponent> = (props) => {
  const { materialType, url, belongType, materialName, weight, spec } = props;
  return (
    <div className={styles.eachMaterialContent}>
      <img
        className={styles.materialPic}
        src={url}
      />
      <div>
        <div className={styles.materialName}>
          {
            materialType === 3 && belongType === 1 ? (
              <div className={styles.yiLianTag}>
                聚麦
              </div>
            ) : null
          }
          {
            materialType === 3 && belongType === 2 ? (
              <div className={styles.selfTag}>
                自有
              </div>
            ) : null
          }
          {materialName}
        </div>
        <div>
          尺寸：
          {spec}
        </div>
        {materialType === 3 ? (
          <div>
            重量：
            {weight}
            g
          </div>
        ) : null }
      </div>
    </div>
  );
};

export default EachMaterialComponent;
