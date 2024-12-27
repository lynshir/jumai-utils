import React from 'react';
import type { BaseData } from './request';
import { request } from './request';
import { toJS } from 'mobx';
import { Empty } from 'antd';

export interface IPermission {
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

function handlePermissionData(permissionListData: string[]): void {
  const data = Array.isArray(permissionListData) ? permissionListData : [];
  data.forEach((item) => {
    permissionList.add(item);
    const pageId = item?.split('_')?.[0];
    if (pageId) {
      permissionList.add(pageId);
    }
  });
}

const permissionList: Set<string> = new Set<string>();
handlePermissionData(toJS(window.top.EgeniePermission?.permissionList || []));

let getPermissionPromise: Promise<any> = null;

export const hasPermission = (permissionId: IPermission['permissionId']): boolean => {
  if (typeof permissionId === 'string') {
    return permissionList.has(permissionId);
  } else if (Array.isArray(permissionId)) {
    return Boolean(permissionId.some((item) => permissionList.has(item)));
  } else {
    return true;
  }
};

export const usePermission = (permissionId: IPermission['permissionId']): boolean => {
  const [
    ,
    forceUpdate,
  ] = React.useState({});

  React.useEffect(() => {
    if (permissionList.size === 0 && getPermissionPromise === null && permissionId != null) {
      getPermissionPromise = request<BaseData<string[]>>({ url: '/api/iac/role/user/perms' })
        .then((info) => handlePermissionData(info.data));
    }

    getPermissionPromise?.then(() => forceUpdate({}));
  }, []);

  return hasPermission(permissionId);
};

export const RenderByPermission: React.FC<IPermission> = ({
  permissionId,
  children,
  renderNoPermission,
}: IPermission): JSX.Element => {
  if (usePermission(permissionId)) {
    return children;
  }

  if (renderNoPermission == null) {
    return null;
  }

  return (
    <Empty
      description={renderNoPermission === 'default' ? '暂无权限访问' : renderNoPermission}
      style={{
        height: '100%',
        display: 'flex',
        lineHeight: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
};
