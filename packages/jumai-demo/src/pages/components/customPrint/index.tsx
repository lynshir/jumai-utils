import { Button, Input, message, Modal, Row, Select, Table } from 'antd';
import { action, computed, observable, toJS } from 'mobx';
import { Observer, observer } from 'mobx-react';
import React from 'react';
import { request } from 'jumai-utils';
import type { BaseData } from 'jumai-common';
import { printHelper, renderModal, destroyModal } from 'jumai-common';
import type { TemplateData } from './types';

interface CustomPrintParam {

  /**
   * 是否预览
   */
  preview?: boolean;

  /**
   * 模版类型
   */
  tempType?: string | number;

  /**
   * 模版id
   */
  templateId?: number | string;

  /**
   * 打印机
   */
  printer?: string;
}

/**
 * Modal的props。外层自己控制显示和隐藏
 */
interface CustomPrintModalProps {

  /**
   * 打印或者预览callback
   * @param params
   */
  callback?: (params: CustomPrintParam) => void;

  /**
   * 初始化筛选的模版类型
   */
  tempType?: string;

  /**
   * 额外的参数
   */
  options?: {

    /**
     * 自定义的url
     */
    customUrl?: string;

    /**
     * 自定义的url的参数
     */
    customParams?: {[key: string]: any; };

    /**
     * 是否选择上一次选择的模板(默认false)
     */
    isChooseLastTemplate?: boolean;
  };

  /**
   * 关闭回掉
   */
  handleCancel?: (...args: any[]) => any;
}

const chooseTemplateCache = new Map<string, string | number>();

class CustomPrintModel {
  constructor(tempType = '', options: CustomPrintModalProps['options'] = {}) {
    this.tempType = tempType;
    this.options = options;
    if (options.isChooseLastTemplate && chooseTemplateCache.has(tempType)) {
      this.rowSelection.selectedRowKeys = [chooseTemplateCache.get(tempType)];
    }

    this.getPrinters();
    this.handleQuery();
  }

  private options: CustomPrintModalProps['options'] = {};

  private tempType = '';

  @observable public printers: string[] = [];

  @observable public tempName = '';

  @action public getPrinters = () => {
    printHelper.getPrinters()
      .then((printers) => this.printers = printers);
  };

  @action public handleChangeTempName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.tempName = event.target.value;
  };

  @action public handleSearchTempName = (value: string) => {
    this.tempName = value || '';
    this.handleQuery();
  };

  @observable public dataSource: TemplateData[] = [];

  @observable public loading = false;

  @observable public rowSelection: { selectedRowKeys: Array<string | number> ; onChange: (selectedRowKeys: Array<number | string>) => void; type: string; fixed: boolean; } = {
    selectedRowKeys: [],
    onChange: (selectedRowKeys: Array<number | string>) => {
      this.rowSelection.selectedRowKeys = selectedRowKeys || [];
    },
    type: 'radio',
    fixed: true,
  };

  @computed
  public get selectedRows(): TemplateData | null {
    if (this.rowSelection.selectedRowKeys.length) {
      return this.dataSource.find((item) => item.printTemplateId === this.rowSelection.selectedRowKeys[0]);
    } else {
      return null;
    }
  }

  @action public handleRowClick = (item: TemplateData): void => {
    // 点击自身且原来已经设置
    if (this.rowSelection.selectedRowKeys.length > 0 && item.printTemplateId === this.rowSelection.selectedRowKeys[0]) {
      this.rowSelection.selectedRowKeys = [];
    } else {
      // @ts-ignore
      this.rowSelection.selectedRowKeys = [item.id];
    }
  };

  public columns = [
    {
      ellipsis: true,
      dataIndex: 'printTemplateId',
      title: '模版编号',
      width: 200,
    },
    {
      ellipsis: true,
      dataIndex: 'tempName',
      title: '模板名称',
      width: 150,
    },
    {
      ellipsis: true,
      dataIndex: 'courier',
      title: '快递公司',
      width: 120,
    },
    {
      dataIndex: 'printerName',
      title: '打印机名称',
      width: 200,
      render: (text: string, row: TemplateData) => {
        return (
          <Observer>
            {
              () => (
                <Select
                  onChange={(value) => row.printerName = value}
                  onClick={(e) => e.stopPropagation()}
                  options={this.printers.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  placeholder="请选择打印机"
                  size="small"
                  style={{ width: '100%' }}
                  value={row.printerName}
                />
              )
            }
          </Observer>
        );
      },
    },
    {
      dataIndex: 'printWidth',
      title: '纸张宽',
      width: 90,
    },
    {
      dataIndex: 'printHeight',
      title: '纸张高',
      width: 90,
    },
    {
      dataIndex: 'rowCount',
      title: '行',
      width: 30,
    },
    {
      dataIndex: 'colsCount',
      title: '列',
      width: 30,
    },
    {
      ellipsis: true,
      dataIndex: 'lastUpdateTime',
      title: '更新时间',
      width: 180,
    },
  ];

  @action public handleQuery = () => {
    this.dataSource = [];
    this.loading = true;
    request<BaseData<TemplateData[]>>({
      method: 'GET',
      url: `/api/baseinfo/rest/print/template/list/type/${this.tempType}`,
    })
      .then((info) => this.dataSource = info?.data || [])
      .finally(() => this.loading = false);
  };
}

@observer
export class CustomPrintModal extends React.Component<CustomPrintModalProps> {
  constructor(props: CustomPrintModalProps) {
    super(props);
    this.store = new CustomPrintModel(props.tempType, props.options);
  }

  private handlePrint = (preview: boolean) => {
    const selectedRows = this.store.selectedRows;
    if (!selectedRows) {
      const error = '请选择打印模板';
      message.error({
        key: error,
        content: error,
      });
      return;
    }

    if (!selectedRows.printerName) {
      const error = '请选择打印机';
      message.error({
        key: error,
        content: error,
      });
      return;
    }

    if (this.props.options?.isChooseLastTemplate) {
      chooseTemplateCache.set(this.props.tempType, selectedRows.printTemplateId);
    }

    if (typeof this.props.callback === 'function') {
      this.props.callback({
        preview,
        tempType: selectedRows.tempType,
        templateId: selectedRows.printTemplateId,
        printer: selectedRows.printerName,
      });
    }
  };

  public store: CustomPrintModel;

  render() {
    const {
      tempName,
      handleChangeTempName,
      handleSearchTempName,
      dataSource,
      columns,
      loading,
      rowSelection,
      handleRowClick,
    } = this.store;
    const { handleCancel } = this.props;
    return (
      <Modal
        footer={(
          <>
            <Button
              danger
              onClick={() => this.handlePrint(true)}
              type="primary"
            >
              打印预览
            </Button>
            <Button
              onClick={() => this.handlePrint(false)}
              type="primary"
            >
              打印
            </Button>
            <Button
              onClick={() => handleCancel?.()}
            >
              取消
            </Button>
          </>
        )}

        maskClosable={false}
        onCancel={() => handleCancel?.()}
        title="打印设置"
        visible
        width={1000}
      >
        <div>
          <Row align="middle">
            <span>
              模板名称：
            </span>
            <Input.Search
              allowClear
              enterButton="搜索"
              onChange={handleChangeTempName}
              onSearch={handleSearchTempName}
              placeholder="请输入模板名称"
              style={{ width: 200 }}
              value={tempName}
            />
          </Row>
          <br/>
          <Table
            bordered={false}
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            onRow={(record) => ({ onClick: () => handleRowClick(record) })}
            pagination={false}
            rowKey="printTemplateId"

            // @ts-ignore
            rowSelection={toJS(rowSelection)}
            scroll={{ y: 300 }}
            size="small"
          />
        </div>
      </Modal>
    );
  }
}

let isFirstRender = false;

export function getCustomPrintParam(tempType: string, options: CustomPrintModalProps['options'] = {}): Promise<CustomPrintParam> {
  if (isFirstRender) {
    return Promise.reject('重复点击');
  }

  isFirstRender = true;
  return new Promise((resolve, reject) => {
    function handleOk(customParams: CustomPrintParam) {
      resolve(customParams);
      isFirstRender = false;
      destroyModal();
    }

    function handleCancel() {
      reject();
      isFirstRender = false;
      destroyModal();
    }

    renderModal(
      <CustomPrintModal
        callback={handleOk}
        handleCancel={handleCancel}
        options={options}
        tempType={tempType}
      />
    );
  });
}

export async function getCustomPrintParamByDefaultTemplate(tempType: string, options: {
  validatePrinterExists?: boolean;
} & CustomPrintModalProps['options'] = {}): Promise<CustomPrintParam> {
  const info = await request<BaseData<TemplateData>>({
    method: 'GET',
    url: `/api/baseinfo/rest/print/template/query/default/type/${tempType}`,
  });
  const {
    validatePrinterExists,
    ...restOptions
  } = options;

  if (info?.data?.printTemplateId) {
    const result = {
      preview: false,
      tempType,
      printer: info.data.printerName,
      templateId: info.data.printTemplateId,
    };

    if (validatePrinterExists) {
      const printer = await printHelper.getPrinters();
      if (printer.includes(info.data?.printerName)) {
        return result;
      } else {
        return getCustomPrintParam(tempType, restOptions);
      }
    } else {
      return result;
    }
  } else {
    return getCustomPrintParam(tempType, restOptions);
  }
}
