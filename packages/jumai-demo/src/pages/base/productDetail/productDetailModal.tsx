import { Button } from 'antd';
import { EgGrid } from 'jumai-utils';
import React from 'react';

// orderFlag为true订单处理
export const productContent = (isCheckedCode, isSuspendCode, productGridModel, addProduct, orderFlag): JSX.Element => {
  return (productGridModel ? (
    <div style={{ overflow: 'auto' }}>
      {
        orderFlag && (
          <div style={{ marginBottom: '10px' }}>
            <Button
              disabled={isCheckedCode || isSuspendCode}
              onClick={addProduct}
            >
              添加商品
            </Button>
          </div>
        )
      }
      <div style={{ height: `${productGridModel.rows?.length > 3 ? 400 : (productGridModel.rows?.length > 0 ? productGridModel.rows?.length * 120 + 40 : 160)}px` }}>
        <EgGrid store={productGridModel}/>
      </div>
    </div>
  ) : (
    <div>
      加载中...
    </div>
  ));
};
