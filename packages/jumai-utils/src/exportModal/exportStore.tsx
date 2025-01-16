import { Button, message, Modal, Popover, Tag } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { action, observable, toJS } from 'mobx';
import { Observer } from 'mobx-react';
import React from 'react';
import type { BaseData } from 'jumai-common';
import { request } from 'jumai-common';
import styles from './index.module.less';
import type { Fields, Template } from './interface';

export class ExportStore {
  constructor(props?) {
    this.parent = props.parent ? props.parent : null;
  }

  @observable public open = false;

  @observable public commitLoading = false;

  @observable public showMergeFlag = false; // 是否显示合并单元格开关

  @observable public mergeFlag = false; // 合并单元格

  @observable public fileName = ''; // 文件名称

  @observable public showTips = false; // 是否显示错误提示

  @observable public exportType = '';// 导出类型

  @observable private queryParam = {}; // 查询条件原始参数

  @observable private queryParamShow = ''; // 查询条件参数中文拼接

  @observable private params = {}; // 导出其它参数，需要单独传的，比如勾选明细id的

  @observable private selectedIds = ''; // 主表或子表勾选的ids

  @observable public templateList: Template[] = []; // 模板列表

  @observable public selectTemplateId: number = null; // 选中行

  @observable public editId = null; // 编辑行id

  @observable public templateColumnList: Fields[] = []; // 配置模板字段列表

  @observable public form: FormInstance = null;

  @observable private parent = null;

  @observable public isAllowAddTemplate = true;// 是否允许新增模板

  @action
  public setForm = (form: FormInstance): void => {
    this.form = form;
  };

  @action
  public onShow = (fileName: string, exportType: string, selectedIds: string, queryParam?: any, queryParamShow?: string, params?: any, showMergeFlag?: boolean, mergeFlag?: boolean, isAllowAddTemplate = true): void => {
    this.fileName = fileName;
    this.exportType = exportType;
    this.selectedIds = selectedIds;
    this.queryParam = queryParam;
    this.queryParamShow = queryParamShow;
    this.params = params;
    this.open = true;
    this.queryTemplateList();
    this.queryTemplateColumnList();
    this.showMergeFlag = showMergeFlag;
    this.mergeFlag = mergeFlag;
    this.isAllowAddTemplate = isAllowAddTemplate;
  };

  @action
  public onClose = (): void => {
    this.open = false;
    this.editId = null;
    this.fileName = '';
    this.showTips = false;
    this.templateList = [];
    this.exportType = null;
    this.selectedIds = '';
    this.queryParam = {};
    this.queryParamShow = '';
    this.selectTemplateId = null;
    this.isAllowAddTemplate = true;
  };

  // 导出
  @action
  public onExport = async(): Promise<void> => {
    if (this.editId !== null) {
      message.error('请先保存模板或取消编辑');
      return;
    }
    if (this.showTips) {
      message.error('文件名称格式不正确');
      return;
    }
    if (!this.fileName) {
      message.error('请填写文件名');
      return;
    }
    if (!this.selectTemplateId) {
      message.error('请选择导出模板');
      return;
    }
    this.commitLoading = true;
    try {
      await request({
        url: '/api/boss/baseinfo/rest/export/task/commit',
        method: 'post',
        data: {
          fileName: this.fileName,
          ids: this.selectedIds,
          queryParam: this.queryParam,
          queryParamShow: this.queryParamShow,
          templateId: this.selectTemplateId,
          params: this.showMergeFlag ? {
            ...this.params,
            mergeFlag: this.mergeFlag ? 1 : 0,
          } : this.params, // 导出其它参数，需要单独传的，比如勾选明细id的
        },
      });
      this.onClose();
      Modal.success({
        closable: true,
        title: '导出',
        content: (
          <div>
            系统正在执行导出，请稍后到
            <span
              className={styles.exportCenterLink}
              onClick={this.handleGotoExportCenter}
            >
              导出任务中心
            </span>
            下载导出文件。
          </div>
        ),
        width: 500,
        okText: '去导出任务中心',
        onOk: this.handleGotoExportCenter,
      });
      if (this.parent && this.parent.exportCallBack) {
        this.parent.exportCallBack();
      }
    } finally {
      this.commitLoading = false;
    }
  };

  private handleGotoExportCenter = () => {
    try {
      // eslint-disable-next-line no-restricted-globals
      top.egenie.openTab('/jumai-ts-baseinfo/exportList/index', 'export_task_center', '导出任务中心', 'zc_pfs');
    } catch (err) {
      console.log(err);
    }
  };

  // 是否合并单元格
  @action
  public onChangeMergeFlag = (checked: boolean): void => {
    this.mergeFlag = checked;
  };

  // 改变文件名称
  @action
  public onChangeFileName = (e): void => {
    const fileName = e.target.value.trim();
    const reg = new RegExp(/^[^\\/?？*|"<>、“”":：]*$/);
    this.showTips = !reg.test(fileName);
    const template = this.templateList.find((item) => item.templateName === fileName && item.id !== this.editId);
    if (template) {
      message.error(`当前已存在名称为【${fileName}】的模板，请重新输入`);
      return;
    }
    this.fileName = fileName;
  };

  // 查询模板列表
  @action
  public queryTemplateList = async(): Promise<void> => {
    const res: BaseData<Template[]> = await request({
      url: '/api/boss/baseinfo/rest/export/template/config/list',
      params: { exportType: this.exportType },
    });
    this.templateList = res.data;
    if (this.templateList.length > 0 && !this.selectTemplateId) {
      this.selectTemplateId = this.templateList[0].id;
    }
  };

  // 查询模板字段列表
  @action
  public queryTemplateColumnList = async(): Promise<void> => {
    const res: BaseData<Fields[]> = await request({
      url: '/api/boss/baseinfo/rest/export/column/config/list',
      params: { exportType: this.exportType },
    });
    this.templateColumnList = res.data;
  };

  // 选择模板
  @action
  public onSelectTemplate = (id: number): void => {
    this.selectTemplateId = id;
  };

  // 新建
  @action
  public newTemplateClick = (): void => {
    if (this.editId !== null) {
      message.error('请先保存或取消编辑当前模板');
      return;
    }
    this.form.resetFields();
    this.templateList.push({
      id: -1,
      templateName: '',
      fields: [],
      tenantId: 0,
    });
    this.templateList = toJS(this.templateList);
    this.editId = -1;
  };

  @action
  public edit = (record: Template): void => {
    if (this.editId !== null) {
      message.error('请先保存或取消编辑当前模板');
      return;
    }
    this.form.setFieldsValue({
      templateName: record.templateName,
      fieldIds: record.fields.map((item) => item.id),
    });
    this.editId = record.id;
  };

  @action
  public delete = (id: number): void => {
    Modal.confirm({
      title: '提示',
      content: '确定要删除该模板吗？',
      onOk: async() => {
        await request({ url: `/api/boss/baseinfo/rest/export/template/config/delete/${id}` });
        message.success('删除成功');
        this.queryTemplateList();
      },
    });
  };

  // 保存
  @action
  public save = async(id?: number): Promise<void> => {
    const values = await this.form.validateFields();
    if (!values.templateName || !values.templateName.trim()) {
      message.error('模板名称不能为空');
      return;
    }
    if (!values.fieldIds || values.fieldIds.length === 0) {
      message.error('模板字段不能为空');
      return;
    }
    const res: BaseData<number> = await request({
      url: '/api/boss/baseinfo/rest/export/template/config/save',
      method: 'POST',
      data: {
        id: id === -1 ? null : id, // -1为新建
        templateName: values.templateName,
        templateIncludeFieldIds: values.fieldIds.join(','),
        exportType: this.exportType,
      },
    });
    message.success('保存成功');
    this.editId = null;
    this.queryTemplateList();
    this.selectTemplateId = res.data;
  };

  // 取消编辑
  @action
  public handleCancel = (id: number): void => {
    if (id === -1) { // 新建
      const templateList = this.templateList.filter((el) => el.id !== -1);
      this.templateList = toJS(templateList);
    }
    this.editId = null;
  };

  // popover
  private renderRestFields = (fields: Fields[]): JSX.Element => {
    return (
      <div className={styles.popover}>
        {fields.map((el) => {
          return (
            <Tag
              className={styles.popoverTags}
              key={el.id}
            >
              {el.baseSerializeSchemaName}
            </Tag>
          );
        })}
      </div>
    );
  };

  @observable public column = [
    {
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
      width: 160,
      editable: true,
    },
    {
      title: '模板字段',
      dataIndex: '',
      key: 'fields',
      editable: true,
      render: (text, record: Template): JSX.Element => {
        return (
          <>
            {Array.isArray(record.fields) && record.fields.slice(0, 4)
              .map((el) => {
                return (
                  <Tag key={el.id}>
                    {el.baseSerializeSchemaName}
                  </Tag>
                );
              })}
            {record.fields.length > 4 && (
              <Popover content={this.renderRestFields(record.fields.slice(4))}>
                <Tag>
                  +
                  {record.fields.length - 4}
                </Tag>
              </Popover>
            )}
          </>
        );
      },
    },
    {
      title: '操作',
      dataIndex: '',
      key: 'operation',
      render: (text, record: Template): JSX.Element => {
        return (
          <Observer>
            {
              () => {
                if (this.editId === record.id) {
                  return (
                    <>
                      <Button
                        className={styles.operationBtn}
                        onClick={this.save.bind(this, record.id)}
                        type="link"
                      >
                        保存
                      </Button>
                      <Button
                        className={styles.operationBtn}
                        onClick={this.handleCancel.bind(this, record.id)}
                        type="link"
                      >
                        取消
                      </Button>
                    </>
                  );
                } else if (record.tenantId !== -1) {
                  return (
                    <>
                      <Button
                        className={styles.operationBtn}
                        onClick={this.edit.bind(this, record, record.tenantId)}
                        type="link"
                      >
                        编辑
                      </Button>
                      <Button
                        className={styles.operationBtn}
                        onClick={this.delete.bind(this, record.id, record.tenantId)}
                        type="link"
                      >
                        删除
                      </Button>
                    </>
                  );
                } else {
                  return null;
                }
              }
            }
          </Observer>
        );
      },
      width: 140,
    },
  ];
}
