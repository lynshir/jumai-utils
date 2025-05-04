import type { MenuDataItem } from 'jumai-common';
import React from 'react';

export const routes: MenuDataItem[] = [
  {
    children: [
      {
        exact: true,
        path: '/',
        redirect: '/dashboard',
      },
      {
        path: '/dashboard',
        title: '仪表盘',
        exact: true,
        component: React.lazy(() => import('./pages/dashboard')),
      },
      {
        path: '/order',
        title: '订单处理',
        exact: true,
        component: React.lazy(() => import('./pages/order')),
      },
    ],
  },
];
