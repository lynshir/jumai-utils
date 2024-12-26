import React from 'react';
import type { BaseData } from 'egenie-common';
import { request } from 'egenie-common';

export type { IPermission } from 'egenie-common';
export { RenderByPermission as Permission, usePermission, hasPermission } from 'egenie-common';

export const getPerms = async(): Promise<void> => {
  if (window.top.EgeniePermission?.permissionList.length) {
    return;
  }
  await request<BaseData<string[]>>({ url: '/api/iac/role/user/perms' })
    .then((res) => {
      if (!window.top.EgeniePermission) {
        window.top.EgeniePermission = {
          checkPermit: () => {
            console.log('checkPermit');
          },
          permissionList: res.data,
          getResourceId: () => {
            return '';
          },
          hasPermit: () => {
            return false;
          },
        };
      } else {
        window.top.EgeniePermission.permissionList = res.data;
      }
    });
};

