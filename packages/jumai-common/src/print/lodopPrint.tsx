import { message } from 'antd';
import React from 'react';
import { generateQrcodeImage } from './generateQrcodeImage';
import type { GenerateQrcodeImageParams } from './generateQrcodeImage';
import type { CommonPrintParams, LodopItem, PrintAbstract, TemplateData } from './types';
import { ENUM_LODOP_ITEM_TYPE } from './types';
import { getTemplateData, getUUID, loadScripts, lodopItemGetText, handleSocketDisconnectNotification, validateData } from './utils';

enum ENUM_LOAD_STATE {
  init,
  loading,
  finish,
}

function zero75(size: number): number {
  return size * 0.75;
}

function getCodeType(text: string): string {
  if (text.includes('128')) {
    return '128Auto';
  } else if (text.includes('Code39')) {
    return 'Code39';
  } else {
    return 'Code93';
  }
}

function setSkuDetail(itemData: LodopItem, data: any): string {
  const {
    id,
    fontFamily,
    fontSize,
    alignment,
    weight,
  } = itemData;
  const idArray: string[] = id.split(',')
    .filter(Boolean);
  const userDataItem: any[] = data[idArray[0].split('-')[0]] || []; // 取userData中的skuList对应的array
  const trStr: string[] = userDataItem.map((item) => {
    return [
      '<tr>',
      idArray.map((idItem) => `<td>${lodopItemGetText(item, idItem)}</td>`)
        .join(''),
      '</tr>',
    ].join('');
  });

  return [
    `<style>td{border: 0px solid #000;height:18px;font-size:${zero75(fontSize)}px;font-family:${fontFamily};font-weight:${weight};text-align:${alignment};}</style>`,
    '<table border="0" cellSpacing="0" cellPadding="0"  width="100%" bordercolor="#000000" style="border-collapse:collapse">',
    trStr.join(''),
    '</table>',
  ].join('');
}

function notifyUserDownloadPlugin() {
  message.info({
    key: 'lodop通知下载',
    content: (
      <div>
        打印控件未启动或者未安装，点击这里
        <a
          href="http://lodop.net/download.html"
          rel="noreferrer"
          target="_blank"
        >
          下载安装
        </a>
        <div>
          如果已安装,可点击这里
          <a
            href="CLodop.protocol:setup"
          >
            重新启动
          </a>
          ,然后刷新本页面
        </div>
      </div>),
    duration: 5,
  });
}

function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

type PrintParams = Omit<CommonPrintParams, 'count'> & { generateQrcodeImageParams?: Pick<GenerateQrcodeImageParams, 'logoSrc' | 'logoWidth' | 'logoHeight'> & { match: RegExp; }; };

export class LodopPrint implements PrintAbstract {
  public static url8000 = 'http://localhost:8000/CLodopfuncs.js?priority=1';

  public static url8001 = 'http://localhost:8001/CLodopfuncs.js';

  public static url18000 = 'http://localhost:18000/CLodopfuncs.js';

  public static licenses: Array<[string, string]> = [
    [
      '成都衫数科技有限公司',
      'E7C39FD5AB0D3D5E3C07D05CDCBF1465',
    ],
    [
      '成都衫數科技有限公司',
      '38341770D3075504D5DE79C86B4DEEEA',
    ],
  ];

  public baseLeft = 0;

  public baseTop = 0;

  private loadState: ENUM_LOAD_STATE = ENUM_LOAD_STATE.init;

  public createTable = (itemDetailList: {[key: string]: LodopItem; }, data: any) => {
    if (itemDetailList == null || Object.keys(itemDetailList).length === 0) {
      return;
    }

    function getStyle(): string {
      return [
        '<style>',
        '.orderNum {font-size: 9px; width: 50px; text-align: center;}',
        'table {width:\'100%\';color: #333333;border-color: #000000;border-collapse: collapse;}',
        'table th {border: 1px solid #000000;}',
        'table td {border: 1px solid #000000;}',
        '</style>',
      ].join('');
    }

    function getThead(idArray: string[], idMap: {[key: string]: LodopItem; }): string {
      return [
        '<thead><tr>',
        '<th class="orderNum">序号</th>',
        idArray.map((currentId) => {
          return `<th style="${getCellStyle(idMap[currentId])}">${idMap[currentId].txt}</th>`;
        })
          .join(''),
        '</tr></thead>',
      ].join('');
    }

    function getTbody(tableData: any[], idArray: string[], idMap: {[key: string]: LodopItem; }): string {
      return tableData.map((item, index) => {
        return [
          '<tr>',
          `<td class="orderNum">${index + 1}</td>`,
          idArray.map((currentId) => {
            const cellText = lodopItemGetText(item, currentId.split('-')[1]);
            return `<td style="${getCellStyle(idMap[currentId])}">${cellText}</td>`;
          })
            .join(''),
          '</tr>',
        ].join('');
      })
        .join('');
    }

    function getCellStyle(item: LodopItem): string {
      const {
        alignment,
        fontFamily,
        fontSize,
        height,
        weight,
        width,
      } = item;
      return `width:${width}px;height:${height}px;font-size:${zero75(fontSize)}px;font-family:${fontFamily};font-weight:${weight};text-align:${alignment};`;
    }

    function getTableWidth(idArray: string[], idMap: {[key: string]: LodopItem; }): number {
      return idArray.reduce((prev, currentId) => prev + idMap[currentId].width, 50);
    }

    function trimMultiLine(str: string): string {
      return str.replace(/ *[\r|\n] */gm, '');
    }

    const {
      orderTitle,
      ...restDetail
    } = itemDetailList;
    const {
      orderValue,
      left,
      top,
    } = orderTitle;
    const orderValueList: string[] = orderValue.split(',');
    const theadHtml = getThead(orderValueList, restDetail);
    const tbodyHtml = getTbody(data[orderValueList[0].split('-')[0]] || [], orderValueList, restDetail);

    const fullHtml = [
      `<head>${getStyle()}</head>`,
      '<body><table>',
      theadHtml,
      `<tbody>${tbodyHtml}</tbody>`,
      '</table></body>',
    ].join('');

    console.log(fullHtml, '表格组装数据');
    this.instance.ADD_PRINT_TABLE(top, left, getTableWidth(orderValueList, restDetail), '100%', trimMultiLine(fullHtml));
  };

  public createItem = async(itemList: LodopItem[], data: any, generateQrcodeImageParams: PrintParams['generateQrcodeImageParams']): Promise<void> => {
    for (let i = 0; i < itemList.length; i++) {
      const {
        id,
        fontFamily,
        fontSize,
        hideText,
        txt,
        width,
        height,
        txttype,
        alignment,
        weight,
        left,
        top,
      } = itemList[i];

      if (
        txttype === ENUM_LODOP_ITEM_TYPE.customText ||
        txttype === ENUM_LODOP_ITEM_TYPE.noTitleText ||
        txttype === ENUM_LODOP_ITEM_TYPE.hasTitleText ||
        txttype === ENUM_LODOP_ITEM_TYPE.tableInlineText ||
        txttype === ENUM_LODOP_ITEM_TYPE.printTime
      ) {
        this.instance.ADD_PRINT_TEXTA(id, top, left, width, height, txttype !== ENUM_LODOP_ITEM_TYPE.customText ? lodopItemGetText(data, id) : txt);
        this.instance.SET_PRINT_STYLEA(id, 'Alignment', alignment);
        this.instance.SET_PRINT_STYLEA(id, 'FontName', fontFamily);
        this.instance.SET_PRINT_STYLEA(id, 'FontSize', zero75(fontSize));
        if (weight > 400) {
          this.instance.SET_PRINT_STYLEA(id, 'Bold', 1); // 1 粗体 0非粗
        }
      } else if (txttype === ENUM_LODOP_ITEM_TYPE.qrCode) {
        // 二维码中间设置logo
        if (generateQrcodeImageParams && generateQrcodeImageParams.match && generateQrcodeImageParams.match.test(id)) {
          const realWidth = Math.min(width, height);
          const {
            match,
            ...rest
          } = generateQrcodeImageParams;
          const qrcodeImageSrc = await generateQrcodeImage({
            ...rest,
            width: realWidth,
            content: lodopItemGetText(data, id),
          });
          this.instance.ADD_PRINT_IMAGE(top, left, realWidth, realWidth, qrcodeImageSrc);
        } else {
          this.instance.ADD_PRINT_BARCODE(top, left, width, height, 'QRCode', lodopItemGetText(data, id));
        }
      } else if (txttype === ENUM_LODOP_ITEM_TYPE.barCode) {
        const showBarText = hideText ? !hideText.includes('不显示码值') : true;
        this.instance.ADD_PRINT_BARCODE(top, left, width, height, getCodeType(txt), lodopItemGetText(data, id));
        this.instance.SET_PRINT_STYLEA(0, 'ShowBarText', showBarText);
      } else if (txttype === ENUM_LODOP_ITEM_TYPE.img) {
        this.instance.ADD_PRINT_IMAGE(top, left, width, height, `<img src="${txt}" height="${height}px" width="${width}px"/>`);
      } else if (txttype === ENUM_LODOP_ITEM_TYPE.verticalLine) {
        // 竖线 intLineStyle 0--实线 1--破折线 2--点线 3--点划线 4--双点划线 intLineWidth 线条宽，整数型，单位是(打印)像素，缺省值是1，非实线的线条宽也是0
        // ADD_PRINT_LINE(Top1,Left1, Top2, Left2,intLineStyle, intLineWidth)
        this.instance.ADD_PRINT_LINE(top, left, top + height, left, 0, 1);
      } else if (txttype === ENUM_LODOP_ITEM_TYPE.horizontalLine) {
        this.instance.ADD_PRINT_LINE(top, left, top, left + width, 0, 1);
      } else if (txttype === ENUM_LODOP_ITEM_TYPE.rect) {
        this.instance.ADD_PRINT_RECT(top, left, width, height, 0, 1);
      } else if (txttype == ENUM_LODOP_ITEM_TYPE.skuDetail) {
        this.instance.ADD_PRINT_TABLE(top, left, width, height, setSkuDetail(itemList[i], data));
      }
    }
  };

  public initPageSize(templateData: TemplateData): void {
    const {
      pageWidth,
      pageHeight,
      intOrient = 1,
      strPageName = '',
    } = templateData;

    const pageW = `${pageWidth}mm`;
    const pageH = `${pageHeight}mm`;
    this.instance.PRINT_INITA(`${this.baseTop}mm`, `${this.baseLeft}mm`, pageW, pageH, strPageName);
    this.instance.SET_PRINT_PAGESIZE(intOrient, pageW, pageH, strPageName);
  }

  private sendToPrinter = async({
    preview,
    printer,
    templateData,
    contents,
    generateQrcodeImageParams,
  }: PrintParams): Promise<void> => {
    await this.init(true);

    this.initPageSize(templateData);

    for (let i = 0; i < contents.length; i++) {
      // 新的一页
      this.instance.NewPage();
      await this.createItem(Array.isArray(templateData.itemList) ? templateData.itemList : [], contents[i], generateQrcodeImageParams);
      this.createTable(templateData.itemDetailList, contents[i]);
    }

    // 打印任务
    const taskId = getUUID();
    this.instance.SET_PRINT_MODE('CUSTOM_TASK_NAME', taskId);

    // 设置打印机
    this.instance.SET_PRINTER_INDEX(printer || 0);

    // 预览逻辑
    if (preview) {
      this.instance.PREVIEW();
    } else {
      this.instance.SET_PRINT_MODE('CATCH_PRINT_STATUS', true);
      this.instance.PRINT();
    }
  };

  /**
   * 插件instance(先调用init，再获取)
   */
  public instance: any = null;

  private loadScripts = async() => {
    const pluginUrls = [
      LodopPrint.url18000,
      LodopPrint.url8000,
      LodopPrint.url8001,
    ];
    console.log('开始加载lodop文件');
    let isLoadSuccess = false;
    for (let i = 0; i < pluginUrls.length && isLoadSuccess === false; i++) {
      try {
        await loadScripts(pluginUrls[i]);
        isLoadSuccess = true;
      } catch (e) {
        console.log(e);
      }
    }

    if (isLoadSuccess === false) {
      throw new Error('加载lodop文件失败');
    }

    console.log('加载lodop文件结束');
  };

  /**
   * 初始化
   */
  public async init(notifyError: boolean): Promise<void> {
    if (this.instance) {
      return;
    }

    if (this.loadState === ENUM_LOAD_STATE.init) {
      this.loadState = ENUM_LOAD_STATE.loading;
    } else if (this.loadState === ENUM_LOAD_STATE.loading) {
      console.log('并发了,等待上次init');
      await sleep(125);
      return this.init(notifyError);
    } else if (this.loadState === ENUM_LOAD_STATE.finish) {
      if (notifyError) {
        notifyUserDownloadPlugin();
      }
      return Promise.reject();
    }

    try {
      await this.loadScripts();

      // 获取instance
      // @ts-ignore
      this.instance = window.getCLodop();
      console.log('获取lodop插件instance成功');

      // 设置注册信息
      this.instance.SET_LICENSES(LodopPrint.licenses[0][0], LodopPrint.licenses[0][1], LodopPrint.licenses[1][0], LodopPrint.licenses[1][1]);

      console.log(`当前有WEB打印服务C-Lodop可用!\n C-Lodop版本:${this.instance.CVERSION}(内含Lodop${this.instance.VERSION})`);

      console.log('校验socket状态开始');
      await this.heartBeatCheck();
      console.log('校验socket状态结束');

      this?.instance?.webskt?.addEventListener('close', () => {
        if (this.loadState === ENUM_LOAD_STATE.finish) {
          handleSocketDisconnectNotification();
        }
      });

      // 更新状态
      this.loadState = ENUM_LOAD_STATE.finish;
    } catch (e) {
      console.log(e);
      if (notifyError) {
        notifyUserDownloadPlugin();
      }

      // 更新状态
      this.loadState = ENUM_LOAD_STATE.finish;
      return Promise.reject();
    }
  }

  /**
   * 获取打印机
   */
  public async getPrinters(): Promise<string[]> {
    await this.init(true);

    const count = this.instance.GET_PRINTER_COUNT() >>> 0;
    const printers: string[] = [];
    for (let i = 0; i < count; i++) {
      printers.push(this.instance.GET_PRINTER_NAME(i));
    }
    return printers;
  }

  /**
   * 获取lodop实列后,检验内部socket是否链接(不校验，第一次发送的数据可能会失败)
   */
  private heartBeatCheck = async(delay = 125) => {
    // 校验socket的连接状态
    if (this?.instance?.webskt?.readyState == 1) {
      return;
    }

    // 延迟时间超过16s秒判断失败
    if (delay > 16 * 1000) {
      message.error('lodop打印组件连接失败');
      throw new Error('lodop打印组件连接失败');
    }

    await sleep(delay);

    // 延迟时间 * 2
    await this.heartBeatCheck(delay * 2);
  };

  /**
   * 打印
   */
  public async print({
    preview,
    printer,
    templateData,
    contents,
    generateQrcodeImageParams,
  }: PrintParams): Promise<void> {
    validateData(contents);

    await this.sendToPrinter({
      preview,
      printer,
      templateData: getTemplateData(templateData),
      contents,
      generateQrcodeImageParams,
    });
  }

  public async getMacAddress(): Promise<string> {
    await this.init(false);
    return new Promise((resolve) => {
      this.instance.GET_SYSTEM_INFO('NetworkAdapter.1.PhysicalAddress');
      this.instance.On_Return = (taskId: string, value: string) => resolve(value);
    });
  }
}
