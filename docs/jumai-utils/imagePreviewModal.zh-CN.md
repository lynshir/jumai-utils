---
title: 图片预览
order: 8
toc: content
---

## Props

```ts
interface ImagePreviewModalProps {
  visible: boolean;
  onCancel: () => void; // 点击关闭按钮时触发
  images: string[]; // 图片列表
  current?: number; // 指定当前渲染的图片索引
  style?: React.CSSProperties; // mask的style
  zIndex?: number;
}
```

## 代码示例

```ts
import React, { useState } from 'react';
import { ImagePreviewModal } from 'jumai-utils';

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button onClick={() => setVisible(true)}>show</button>
      <ImagePreviewModal
        visible={visible}
        onCancel={() => setVisible(false)}
        images={[
          'https://front.jmaihome.cn/pc/ts/jumai-ts-oms/workOrder/04352E5B-45D4-44ED-AB1F-B8F6B3BA0FCF_1691562118905_9zhul83k4n-1662082758185.jpg',
          'https://p3-aio.ecombdimg.com/obj/ecom-shop-material/PGeJrhYg_m_0113f79396494b1e3c5b95d99c398bbb_sx_193059_www800-800',
          'https://pic.ejingling.cn/TESTPOS/1553230/pic/1670384423609-O1CN01gk50U42Nf0q7xIIFY_!!622429989.jpg',
        ]}
      />
    </>
  );
};
```
