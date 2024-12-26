---
title: 简介
order: 0
toc: content
---

## `大体流程`

![大体流程](../../assets/programme.png)

- `主要是指model层`
- `设计思路和打印一样`
  - 外层提供上下、左右查询方案
  - FilterItems 对所有查询项管理
  - 单个查询项实现各自逻辑
  - FilterBase 抽取公共属性、方法
