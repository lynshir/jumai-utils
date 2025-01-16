import { Button, Space } from 'antd';
import type { ModalProps, UploadProps } from 'antd';
import { action, observable, set } from 'mobx';
import React from 'react';
import type { BaseData } from '../index';
import { request } from '../index';
import type { ImportModelProps, ImportPercent, ImportConditionGroup } from './types';

export class ImportModel {
  @observable public visible = false;

  @observable public buttonLoading = false;

  @observable public progressStatus: any = 'active';

  @observable public file: any;

  @observable public taskStatus: number;

  @observable public sheetName: string;

  @observable public percent = 0;

  @observable public isImportClick = false;

  @observable public importTaskId = '';

  @observable public type = 1;

  @observable public otherParams = {};

  @observable public onCloseCallback: () => void;

  @observable public importConditionGroup: ImportConditionGroup[] = [];

  private interval = null;

  @action public onCancel = () => {
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = undefined;
    }
    this.file = undefined;
    this.taskStatus = undefined;
    this.progressStatus = 'active';
    this.visible = false;
    this.buttonLoading = false;
    this.isImportClick = false;
    this.importTaskId = '';
    this.sheetName = '';
    this.otherParams = {};
    this.importConditionGroup = [];
    this.type = 1;
    this.percent = 0;
    this.stopInterval();
  };

  @action public openModal = (params: ImportModelProps) => {
    this.visible = true;
    this.sheetName = params.sheetName;
    this.otherParams = params?.otherParams || {};
    if (params.importConditionGroup?.length) {
      this.importConditionGroup = params.importConditionGroup;
    }
    this.onCloseCallback = params?.onCloseCallback;
  };

  @action public startImporting = async() => {
    this.isImportClick = true;
    if (this.file) {
      try {
        this.buttonLoading = true;
        const form = new FormData();
        form.append('file', this.file);
        form.append('importType', this.sheetName);
        form.append('importParamShow', this.getImportParams.importParamShow);
        form.append('importParam', this.getImportParams.importParam);
        const req = await request<BaseData>({
          method: 'POST',
          url: '/api/boss/baseinfo/rest/imports/uploadExcelAndImport',
          data: form,
          headers: { 'Content-Type': 'multipart/form-data;charset=utf-8;' },
        });
        if (req.data) {
          this.importTaskId = `${req.data}`;
          this.type = 2;
          this.polling();
        }
        this.buttonLoading = false;
      } catch (e) {
        this.buttonLoading = false;
      }
    }
  };

  @action public stopInterval = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  };

  @action public onSwitchClick = (checked: boolean, key: string) => {
    this.importConditionGroup.forEach(async(item) => {
      if (item.key === key) {
        item.onChangeCallback && await item.onChangeCallback(key, checked);
        set(item, { value: checked });
      }
    });
  };

  // 下载模版
  @action public downloadTemplate = () => {
    window.open(`/api/boss/baseinfo/rest/imports/downloadExcelTemplate/${this.sheetName}`);
  };

  // 轮询查询导入进度
  @action
  public polling = () => {
    this.interval = setInterval(() => {
      request<BaseData<ImportPercent>>({
        method: 'GET',
        url: `/api/boss/baseinfo/rest/imports/getImportPercent/${this.importTaskId}`,
      })
        .then((req) => {
          const {
            percent,
            taskStatus,
            failedOssUrl,
          } = req.data;
          this.percent = Number(percent.replaceAll(/%/g, '')) || 0;
          if (taskStatus >= 2) {
            this.taskStatus = taskStatus;
            if ([
              3,
              4,
            ].indexOf(taskStatus) !== -1) {
              this.progressStatus = 'exception';
              failedOssUrl && window.open(failedOssUrl);
            }
            this.stopInterval();
          }
          if (this.percent === 100 && taskStatus === 2) {
            this.progressStatus = 'success';
            this.stopInterval();
          }
        })
        .catch((e) => {
          this.taskStatus = 5;
          this.stopInterval();
        });
    }, 3000);
  };

  public get taskStatusTitle() {
    const enumTaskStatus = {
      '2': {
        title: '导入成功',
        color: '#02C190',

      },
      '4': {
        title: '导入部分失败',
        color: '#FA6866',

      },
      '3': {
        title: '导入失败',
        color: '#FA6866',

      },
      '5': {
        title: '网络异常',
        color: '#6D6E78',
      },
    };
    return enumTaskStatus[this.taskStatus];
  }

  public get importModalParams(): ModalProps {
    return {
      visible: this.visible,
      maskClosable: false,
      centered: true,
      onCancel: this.onCancel,
      width: 500,
      title: this.type === 1 ? '导入' : '正在导入',
      footer: (
        <Space>
          <Button onClick={this.onCancel}>
            关闭
          </Button>
          {this.type === 1 ? undefined : (
            <Button
              onClick={this.openMissionCenter}
              type="primary"
            >
              打开导入导出任务中心
            </Button>
          )}
        </Space>
      ),
    };
  }

  public get uploadParams(): UploadProps {
    return {
      accept: '.xlsx',
      beforeUpload: () => false,
      fileList: [],
      maxCount: 1,
      onChange: action(({
        file,
        fileList,
        event,
      }) => {
        if (file) {
          this.file = file;
        }
      }),
    };
  }

  public openMissionCenter = () => {
    try {
      top.egenie.openTab('/jumai-ts-baseinfo/exportList/index?type=import', 'export_task_center', '导入导出任务中心', 'zc_pfs');
    } catch (e) {
      console.error(e);
    }
  };

  public get getImportParams() {
    const importParam = { otherParams: this.otherParams };
    const importParamShow: string[] = [];
    this.importConditionGroup?.map((item) => {
      importParam[item.key] = item.value ? '1' : '0';
      importParamShow.push(`${item.title}:${item.value ? '是' : '否'}`);
    });
    return {
      importParam: JSON.stringify(importParam),
      importParamShow: importParamShow.join(';'),
    };
  }
}

