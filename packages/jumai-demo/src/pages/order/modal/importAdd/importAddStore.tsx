import { message } from 'antd';
import type { FormInstance } from 'antd';
// import { excelImport, templateDownload, excelExport } from 'jumai-import-export';
import type { BaseData } from 'jumai-utils';
import { request } from 'jumai-utils';
import { observable, action } from 'mobx';
import { toJSONSchema } from 'mockjs';
import React from 'react';

interface exportResItem{
  failed_reason: any;
}

export default class ImportAddStore {
  constructor(options) {
    this.parent = options.parent;
  }

  @observable public parent;

  @observable public showImporModal = false;

  @observable public importType = 'addOrder';

  @observable public formRef = React.createRef<FormInstance>();

  @observable public loading = false;

  @observable public isCover = false;

  @action public closeImportModal = (): void => {
    this.formRef.current?.resetFields();
    this.loading = false;
    this.showImporModal = false;
  };

  @action public openImportModal = (): void => {
    this.showImporModal = true;
  };

  @action public handleDownload = (): void => {
    if (this.importType === 'addOrder') {
      // templateDownload.download('sale_order_detail_import', '订单信息');
    } else {
      // templateDownload.download('add_sale_order_detail_import', '订单添加明细');
    }
  };

  private _checkDuplicateMap = {};

  private clearImportCustomProps = () => {
    this._checkDuplicateMap = {};
  };

  private importProductCallBack = (_tableJson, _data) => {
    console.log(_tableJson, '_tableJson');
    console.log(_data, '_data');
    const excelCol = _data.slice(0, 1)[0].split(',');
    const data = _data.slice(1).map((v) => v.split(',')); // 二维数组
    const importData = [];
    for (let i = 0; i < data.length; i++) {
      const xlsData = data[i];
      const [
        platform_order_code,
        sku_no,
        num,
      ] = [
        xlsData[0],
        xlsData[1],
        xlsData[2],
      ];
      importData.push({
        platformOrderCode: platform_order_code.trim(),
        skuNo: sku_no.trim(),
        num: num.trim(),
      });
    }

    // commonPost('/api/oms/rest/importOrderDetail', { importSaleOrderSkuList: importData }).then(action((v) => {
    //   this.loading = false;
    //   if (v.status !== 'Successful') {
    //     return Message.error(v.data);
    //   }
    //   const res = v.data || [];
    //   const failedData = res.filter((el) => el.failed_reason);

    //   // 如果存在错误则导出错误数据
    //   if (failedData.length) {
    //     const exportProperties = { directExport: true };
    //     import(/* webpackChunkName: "importexport" */ 'jumai-import-export').then(({ excelExport }) => {
    //       excelExport.exportData('failed_add_sale_order_detail_import', '订单导入商品错误信息', failedData, exportProperties);
    //     });
    //   } else {
    //     this.onClose();
    //     Message.success('导入完成');
    //   }
    // }));

    request<BaseData<exportResItem[]>>({
      url: '/api/oms/rest/importOrderDetail',
      method: 'POST',
      data: { importSaleOrderSkuList: importData },
    }).then((res) => {
      this.loading = false;
      const list = res.data || [];
      const failedData = list?.filter((item) => item.failed_reason);
      if (failedData.length) {
        const exportProperties = { directExport: true };
        // excelExport.exportData('failed_add_sale_order_detail_import', '订单导入商品错误信息', failedData, exportProperties);
      } else {
        message.success('导入完成');
        this.closeImportModal();
      }
    });
  };

  @action public handleImport = async() => {
    const { file } = await this.formRef.current.validateFields();

    const originFile = file[0].originFileObj;

    // const file: any = document.getElementById('fileNameInput');
    // console.log(file);
   
    // if (file.files.length === 0) {
    //   this.loading = false;
    //   message.warn('请选择需要导入的文件！');
    //   return;
    // }

    // 导入商品
    if (this.importType === 'addProduct') {
      this.loading = false;
      const params = {
        fileName: '订单添加信息',
        onlyParse: true,
        importOverRollback: this.importProductCallBack,
      };

      // excelImport.importXlsx('add_sale_order_detail_import', {
      //   files: [originFile],
      //   value: originFile.name,
      // }, params);

      // excelImport.importXlsx('sale_order_detail_import', file, params);
    }

    // 导入订单
    if (this.importType === 'addOrder') {
      this.loading = false;

      /**
       * 客户自定义字典导入时的自定义去重方法
       * 同类型的字典的userCode和name都不能重复
       *
       * @param  {[type]} currectData          需要去重的数据
       * @param  {[type]} titles               excel的标题对应的英文数组
       * @param  {[type]} baseSerializeSchemas 元数据
       * @param  {[type]} idMap                excel的标题和元数据的映射关系
       * @return {[type]}                      返回重复的行数和原因
       */
      const innerDistinct = (currectData, titles, baseSerializeSchemas, idMap) => {
        const platformOrderCodeIndex = titles.indexOf('platform_order_code');
        const skuIdIndex = titles.indexOf('sku_id');
        const duplicateData = {
          duplicateIndices: [],
          duplicateReasons: [],
        };
        const count = currectData.length;
        let lastPlatformOrderCode = '';
        for (let i = 0; i < count; i++) {
          const data = currectData[i];
          let duplicateTitles = '';
          if (data[platformOrderCodeIndex]) {
            lastPlatformOrderCode = data[platformOrderCodeIndex];
          }
          if (!this._checkDuplicateMap[lastPlatformOrderCode]) {
            const skuIdIndices = {};
            skuIdIndices[data[skuIdIndex]] = true;
            this._checkDuplicateMap[lastPlatformOrderCode] = skuIdIndices;
          } else {
            if (this._checkDuplicateMap[lastPlatformOrderCode][data[skuIdIndex]]) {
              duplicateTitles += `[${ baseSerializeSchemas[idMap[skuIdIndex]].baseSerializeSchemaName }];`;
            } else {
              this._checkDuplicateMap[lastPlatformOrderCode][data[skuIdIndex]] = true;
            }
          }
          if (duplicateTitles !== '') {
            duplicateData.duplicateIndices.push(i);
            duplicateData.duplicateReasons.push(duplicateTitles);
          }
        }
        console.log(`有${ duplicateData.duplicateIndices.length }条重复数据`);
        return duplicateData;
      };

      const params = {
        fileName: '订单信息',
        saveCount: 300,
        oneToAll: true,
        innerDistinct,
        clearImportCustomProps: this.clearImportCustomProps,
        importUrl: '/api/oms/rest/excelImport/omsExcelImport',
      };

      // excelImport.importXlsx('sale_order_detail_import', {
      //   files: [originFile],
      //   value: originFile.name,
      // }, params);

      // excelImport.importXlsx('sale_order_detail_import', file, params);
    }
    this.loading = false;
  };
}
