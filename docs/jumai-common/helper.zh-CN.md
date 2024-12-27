---
title: 数字处理
order: 1
toc: content
---

# `下面所有方法不需要在外部对数字做任何转换(内部已经处理)`

## `formatNumber`

- 签名

```ts
/**
 * 格式化为number
 * @param num 数字
 */
export declare function formatNumber(num: unknown): number;
```

## `add`

- 签名

```ts
/**
 * 浮点数相加
 * @param num1 数字1
 * @param num2 数字2
 */
export declare function add(num1: unknown, num2: unknown): number;
```

## subtract

- 签名

```ts
/**
 * 浮点数相减
 * @param num1 减数
 * @param num2 被减数
 */
export declare function subtract(num1: unknown, num2: unknown): number;
```

## `multiple`

- 签名

```ts
/**
 * 浮点数相乘
 * @param num1 数字1
 * @param num2 数字2
 */
export declare function multiple(num1: unknown, num2: unknown): number;
```

## `toFixed`

- 签名

```ts
/**
 * 保留小数点位数。Number.prototype.toFixed有bug
 * @param num 数字
 * @param decimalLength 小数点位数(默认0)
 */
export declare function toFixed(num: unknown, decimalLength?: number): string;
```

> 示例:

```ts
import { toFixed } from 'jumai-common';

// 默认不保留小数
toFixed(111.222);

// 通过参数控制保留小数
toFixed(111.222, 2);
```

## formatPrice

- 签名

```ts
/**
 * 格式化价格
 * @param price 价格
 * @param decimalLength 小数点位数(默认2)
 */
export declare function formatPrice(price: unknown, decimalLength?: number): number;
```

> 示例:

```ts
import { formatPrice } from 'jumai-common';

// 默认保留2位小数
formatPrice(111.222);

// 通过参数控制保留小数
formatPrice(111.222, 1);
```

## thousandthSeparator

- 签名

```ts
/**
 * 千分位
 * @param num 数字
 */
export declare function thousandthSeparator(num: unknown): string;
```
