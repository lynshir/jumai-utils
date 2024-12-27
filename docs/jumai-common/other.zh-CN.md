---
title: 其他
order: 3
toc: content
---

## `history`

- [react-router-dom 的 history 对象](https://reactrouter.com/web/api/history)
  > 示例:

```ts
import { history } from 'jumai-common';

console.log(history);
```

## MenuDataItem

- 路由的配置数据,用法参考项目 src/routes

```ts
export class MenuDataItem {
  // react-router的exact
  public exact?: boolean;

  // react-router的sensitive
  public sensitive?: boolean;

  // react-router的strict
  public strict?: boolean;

  // 标题
  public title?: string;

  // 路径
  public path?: string;

  // 子路由-支持n级
  public children?: MenuDataItem[];

  // 子组件-支持n级
  public component?: React.ReactType;

  // 菜单权限id
  public permissionId?: string | string[];

  public hideChildrenInMenu?: boolean;

  public hideInMenu?: boolean;

  public icon?: string;

  public locale?: string;

  [key: string]: any;
}
```

## ajax 封装

### `request`

- `如果返回满足以status或者success字段区分成功，不需要再手动判断请求是否成功，和给出错误提示`
- [axios.request](https://github.com/axios/axios#request-config)---`Request Config`
- 签名

```ts
import { AxiosRequestConfig } from 'axios';
/**
 * @param options axios配置
 */
export declare function request<T = unknown>(options?: AxiosRequestConfig): Promise<T>;
```

### `BaseData`

- 常见的后端数据返回结构

```ts
export class BaseData<T = unknown> {
  public status?: string;

  public info?: string;

  public data: T;
}
```

### `PaginationData`

- 常见的后端分页的数据返回结构

```ts
export class PaginationData<T = unknown> {
  public status?: string;

  public info?: string;

  public success?: boolean;

  public errorMsg?: string;

  public errorCode?: number;

  public data: {
    list: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPageCount: number;
    calTotalPageCount: number;
    first: number;
  };
}
```

### BatchReportData

- 批量报告的数据返回结构

```ts
export class BatchReportData<T = unknown> {
  public status: string;

  public info: string;

  public data: {
    total: number;
    successedList: T[];
    successed: number;
    operationName: string;
    failed: number;
    list?: T[];
    failedList?: T[];
  };
}
```

### PureData

- 后端直接返回 data 对象

```ts
export class PureData<T = unknown> {
  public calTotalPageCount: number;

  public first: [];

  public list: T[];

  public page: number;

  public pageSize: number;

  public totalCount: number;

  public totalPageCount: number;
}
```

> `get请求(参数放在params)`

```ts
import { request, BaseData } from 'jumai-common';

request<BaseData<number>>({
  url: 'path',
  params: { age: 18 },
}).then((info) => {
  console.log(info);
});
```

> `post表单请求(建议用URLSearchParams对象处理data)`

```ts
import { request, PaginationData } from 'jumai-common';

request<PaginationData<{ age: 10 }>>({
  url: 'path',
  method: 'POST',
  data: new URLSearchParams(
    Object.entries({
      page: '10',
      vo: JSON.stringify({}),
    }),
  ),
}).then((info) => {
  console.log(info);
});
```

> `常规post请求(content-type是json格式)`

```ts
import { request, BaseData } from 'jumai-common';

request<BaseData<string>>({
  url: 'path',
  method: 'POST',
  data: { age: 10 },
}).then((info) => {
  console.log(info);
});
```

## 声音

### playVoice

- 描述: 播放声音
- 类型: (url: string) => void
  - url: 声音 url 地址
- 默认值: 无

### getAndPlayVoice

- 描述: 获取声音数据并播放
- 类型: (tex: string, per?: string) => void
  - tex: 语音文本
  - per: 声音类型(默认'0',女声)
- 默认值: 无

> `示例:`

```ts
import { playVoice, getAndPlayVoice } from 'jumai-common';

// 播放声音
playVoice('https://front.runscm.com/customer-source/ring/di.mp3');

// 获取声音数据并播放
getAndPlayVoice('通过');
```

## getStaticResourceUrl

- 描述: 获取静态资源 url(路由前缀由环境变量给)
- 类型: (relativePath: string) => string
  - relativePath: 资源的相对路径

> `示例:`

```ts
import { getStaticResourceUrl } from 'jumai-common';

getStaticResourceUrl('customer-source/ring/di.mp3');
```

## egeniePcTheme

- 描述: pc 的主题(原来 jumai-config 下的 less 的 theme 变量)
- 前提: `jumai-common大于等于0.14.9`
  > `示例:`

```ts
import { egeniePcTheme } from 'jumai-common';

console.log(egeniePcTheme.color);
console.log(egeniePcTheme.font);
console.log(egeniePcTheme.spacing);
```

## passwordReg

- 包含字母和数字且长度在 8 到 16 位的密码

## phoneReg

- 手机号正则

## emailReg

- 邮箱正则

## Image

- 对图片及图片 hover 预览封装,ImgFormatter 底层依赖
- 前提: `jumai-common和jumai-utils版本大于等于1.2.29`
- 组件 props

```ts
type ImgElementProps = JSX.IntrinsicElements['img'];

export interface ImageProps extends ImgElementProps {
  /**
   * 图片src
   */
  src?: string;

  /**
   * 图片默认src(默认https://front.ejingling.cn/customer-source/noPic.png)
   */
  defaultSrc?: string;

  /**
   * 图片显示宽度(默认32)
   */
  width?: number | string;

  /**
   * 图片显示高度(默认32)
   */
  height?: number | string;

  /**
   * 图片预览显示宽度(默认320)
   */
  previewWidth?: number;

  /**
   * 图片预览显示高度(默认320)
   */
  previewHeight?: number;

  /**
   * 图片预览显示高度(默认向右向下20)
   */
  previewOffsetDistance?: number;
}
```

## 权限

### usePermission(hook)

```ts
const hasPermission = usePermission('permissionId');
```

### RenderByPermission

- 渲染对应权限组件

```tsx | pure
interface Props {
  permissionId: string | string[];
  children?: JSX.Element;

  /**
   * 没有权限时渲染的内容
   * 默认为null---什么都不渲染
   * default---提示暂无权限访问
   * string---自定义渲染的文字
   * 其他情况根据usePermission自行渲染
   */
  renderNoPermission?: null | 'default' | string;
}

<RenderByPermission permissionId="permissionId">
  <div>hello</div>
</RenderByPermission>;
```
