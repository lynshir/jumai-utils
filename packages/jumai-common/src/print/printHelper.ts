import { message } from 'antd';
import { AiKuCunPrint } from './aiKuCunPrint';
import { ChannelsShopPrint } from './channelsShopPrint';
import { JdPrint } from './jdPrint';
import { LodopPrint } from './lodopPrint';
import { PrintPluginBase } from './printPluginBase';
import type { CommonPrintParams, KsPrintParams, PddPrintParams } from './types';
import { ENUM_PRINT_PLUGIN_TYPE } from './types';
import {
  formatDyData,
  formatJdData,
  formatKsData,
  formatChannelsShopData,
  formatPddData,
  formatPrintName,
  formatRookieCustomData,
  formatRookieData,
  formatVopData,
  formatXiaoHongShuData,
  sliceData,
  validateData,
  formatDwData,
} from './utils';

function openError(platform: string): string {
  return `系统未连接打印控件\n。请在首页安装${platform}且正常启动打印组件后重启浏览器`;
}

declare global {
  interface Window {
    ZPL_JSSDK: any;
  }
}

class PrintHelper {
  private state: ENUM_PRINT_PLUGIN_TYPE = ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld;

  // private printingStatus: boolean = false;
  /**
   * 切换到lodop---兼容原来
   */
  // public readonly setPrintingStatus = (printFinished: boolean) => {
  //   console.log('更新状态', printFinished);
  //   this.printingStatus = !printFinished;
  // };

  /**
   * 第一次直接调用执行，之后通过各个打印组件打印完成的回调来调用
   * 如果printQueue.length为0，说明队列已打印完，重置第一次打印标记为true，否则下一次进来无法开始打印
   */
  public loopPrintQueue = async (): Promise<void> => {
    console.log('this.printQueue.length', this.printQueue.length);
    if (this.printQueue.length === 0) {
      this.isFirstPrint = true;
      return;
    }
    const item = this.printQueue.shift();
    const { state, printData } = item;
    this.sendPrint(state, printData);
  };

  private readonly rookiePrintPlugin = new PrintPluginBase('ws://127.0.0.1:13528', openError('菜鸟'), this.loopPrintQueue);

  private readonly xiaoHongShuPrintPlugin = new PrintPluginBase('ws://127.0.0.1:10818', openError('小红书'), this.loopPrintQueue);

  private readonly pddPrintPlugin = new PrintPluginBase('ws://127.0.0.1:5000', openError('拼多多'), this.loopPrintQueue);

  private readonly dyPrintPlugin = new PrintPluginBase('ws://127.0.0.1:13888', openError('抖音'), this.loopPrintQueue);

  private readonly ksPrintPlugin = new PrintPluginBase('ws://127.0.0.1:16888/ks/printer', openError('快手'), this.loopPrintQueue);

  private readonly dwPrintPlugin = new PrintPluginBase('ws://127.0.0.1:23825', openError('得物'), this.loopPrintQueue);

  private readonly jdPrintPlugin = new JdPrint('ws://127.0.0.1:9113', openError('京东'), this.loopPrintQueue);

  private readonly channelsShopPrintPlugin = new ChannelsShopPrint('ws://127.0.0.1:12705', openError('视频号'), this.loopPrintQueue);

  private readonly aiKuCunPrintPlugin = new AiKuCunPrint('ws://localhost:2750', openError('爱库存'), this.loopPrintQueue);

  public readonly lodopPrintPlugin = new LodopPrint();

  /**
   * 切换到lodop---兼容原来
   */
  public readonly toggleToLodop = () => {
    this.state = ENUM_PRINT_PLUGIN_TYPE.lodop;
  };

  /**
   * 切换到菜鸟(旧版可以打面单、小票等)---兼容原来
   * 模板是从id获取
   */
  public readonly toggleToRookie = () => {
    this.state = ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld;
  };

  /**
   * 切换到菜鸟自定义
   * 模板直接返回
   */
  public readonly toggleToRookieCustom = () => {
    this.state = ENUM_PRINT_PLUGIN_TYPE.rookieCustom;
  };

  /**
   * 获取打印机
   */
  public readonly getPrinters = async (): Promise<string[]> => {
    const printPlugins = [
      this.lodopPrintPlugin,
      this.rookiePrintPlugin,
      this.dyPrintPlugin,
      this.pddPrintPlugin,
      this.jdPrintPlugin,
      this.ksPrintPlugin,
      this.xiaoHongShuPrintPlugin,
      this.channelsShopPrintPlugin,
      this.aiKuCunPrintPlugin,
      this.dwPrintPlugin,
    ];

    let printers: string[] = [];
    for (let i = 0; i < printPlugins.length && printers.length === 0; i++) {
      try {
        printers = await printPlugins[i].getPrinters();
      } catch (e) {
        message.destroy();
        console.log(e, '尝试获取打印机错误,可忽略');
      }
    }

    return printers;
  };

  // 上次打印的状态，如果新状态不一致，则下次打印等待500ms
  public preState: ENUM_PRINT_PLUGIN_TYPE = ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld;
  public isDelay = false;

  public printQueue: Array<{ state: ENUM_PRINT_PLUGIN_TYPE; printData: any }> = [];
  private isFirstPrint: boolean = true;

  private onFirstPrint = () => {
    if (this.isFirstPrint) {
      this.isFirstPrint = false;
      this.loopPrintQueue();
    }
  };

  public clearQueue = () => {
    this.printQueue = [];
  };
  public readonly print = async (params: CommonPrintParams | PddPrintParams | KsPrintParams): Promise<any> => {
    // await this.waitForLimitPrint();
    // // 正在打印
    // this.printingStatus = true;
    // this.retryCount = 0;

    try {
      validateData(params.contents);
    } catch (error) {
      this.isFirstPrint = true;
    }
    params = {
      ...params,

      // 类型缩减需要
      state: params.state != null ? params.state : this.state,
    };
    const printer = formatPrintName(params.templateData, params.printer);
    switch (params.state) {
      case ENUM_PRINT_PLUGIN_TYPE.jdCloud:
      case ENUM_PRINT_PLUGIN_TYPE.jdErp: {
        const printData = formatJdData(params.contents, params.state, params.preview, printer);
        try {
          validateData(printData);
        } catch (error) {
          this.isFirstPrint = true;
        }
        for (let i = 0; i < printData.length; i++) {
          // this.printQueue.push({ [params.state]: printData[i] });
          this.printQueue.push({ state: params.state, printData: printData[i] });
          // await this.jdPrintPlugin.print(printData[i]);
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld:
      case ENUM_PRINT_PLUGIN_TYPE.rookieErp: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          const contents = formatRookieData(pageData[i], params.state, params.templateData);
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              contents,
              printer,
              previewType: params.previewType,
            },
          });

          // await this.rookiePrintPlugin.print(
          //   {
          //     preview: params.preview,
          //     contents,
          //     printer,
          //     previewType: params.previewType,
          //   },
          //   this.isDelay,
          // );
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.rookieCustom: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          const contents = formatRookieCustomData(pageData[i], params.templateData);
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              contents,
              printer,
              previewType: params.previewType,
            },
          });
          // await this.rookiePrintPlugin.print(
          //   {
          //     preview: params.preview,
          //     contents,
          //     printer,
          //     previewType: params.previewType,
          //   },
          //   this.isDelay,
          // );
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.dyCloud:
      case ENUM_PRINT_PLUGIN_TYPE.dyErp: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          const contents = formatDyData(pageData[i], params.state);
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              contents,
              printer,
            },
          });
          // await this.dyPrintPlugin.print(
          //   {
          //     preview: params.preview,
          //     contents,
          //     printer,
          //   },
          //   this.isDelay,
          // );
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.ksCloud:
      case ENUM_PRINT_PLUGIN_TYPE.ksErp: {
        // 快手建议10条以内
        const pageData = sliceData(params.contents, 10);

        for (let i = 0; i < pageData.length; i++) {
          const contents = formatKsData(pageData[i], params.state, params.cpCode);
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              contents,
              printer,
            },
          });
          // await this.ksPrintPlugin.print(
          //   {
          //     preview: params.preview,
          //     contents,
          //     printer,
          //   },
          //   this.isDelay,
          // );
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.pddCloud:
      case ENUM_PRINT_PLUGIN_TYPE.pddErp: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          const contents = formatPddData(pageData[i], params.state, params.courierPrintType);
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              contents,
              printer,
            },
          });
          // await this.pddPrintPlugin.print(
          //   {
          //     preview: params.preview,
          //     contents,
          //     printer,
          //   },
          //   this.isDelay,
          // );
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.lodop: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              printer,
              contents: pageData[i],
              templateData: params.templateData,
            },
          });
          // await this.lodopPrintPlugin.print({
          //   preview: params.preview,
          //   printer,
          //   contents: pageData[i],
          //   templateData: params.templateData,
          // });
        }
        // lodop打印条码不阻塞
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.dw: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          const contents = await formatDwData(pageData[i]);
          this.printQueue.push({
            state: params.state,
            printData: {
              cmd: params.preview ? 'preview' : undefined,
              preview: params.preview,
              contents,
              printer,
            },
          });
          // await this.dwPrintPlugin.print(
          //   {
          //     cmd: params.preview ? 'preview' : undefined,
          //     preview: params.preview,
          //     contents,
          //     printer,
          //   },
          //   this.isDelay,
          // );
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuErp:
      case ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuCloud: {
        const pageData = sliceData(params.contents, params.count);
        console.log(pageData, '小红书打印数据');
        for (let i = 0; i < pageData.length; i++) {
          const contents = formatXiaoHongShuData(pageData[i], params.state);
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              contents,
              printer,
            },
          });
          // await this.xiaoHongShuPrintPlugin.print({
          //   preview: params.preview,
          //   contents,
          //   printer,
          // });
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.vopCloud:
      case ENUM_PRINT_PLUGIN_TYPE.vopErp: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          const contents = formatVopData(pageData[i], params.state);
          this.printQueue.push({
            state: params.state,
            printData: {
              preview: params.preview,
              contents,
              printer,
            },
          });
          // await this.rookiePrintPlugin.print({
          //   preview: params.preview,
          //   contents,
          //   printer,
          // });
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.channelsShop: {
        const pageData = sliceData(params.contents, params.count);

        for (let i = 0; i < pageData.length; i++) {
          const contents = formatChannelsShopData(pageData[i]);
          this.printQueue.push({
            state: params.state,
            printData: {
              ...params,
              preview: params.preview,
              printer,
              contents,
            },
          });
          // await this.channelsShopPrintPlugin.print({
          //   ...params,
          //   preview: params.preview,
          //   printer,
          //   contents,
          // });
        }
        this.onFirstPrint();
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.aiKuCun: {
        this.printQueue.push({
          state: params.state,
          printData: {
            contents: params.contents,
          },
        });
        // await this.aiKuCunPrintPlugin.print({ contents: params.contents });
        this.onFirstPrint();
        break;
      }
      default:
        this.isFirstPrint = true;
        throw new Error('插件类型不存在,在外部被非法改掉');
    }
  };

  private readonly sendPrint = async (state: ENUM_PRINT_PLUGIN_TYPE, printData): Promise<any> => {
    switch (state) {
      case ENUM_PRINT_PLUGIN_TYPE.jdCloud:
      case ENUM_PRINT_PLUGIN_TYPE.jdErp: {
        await this.jdPrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.rookieCustomOld:
      case ENUM_PRINT_PLUGIN_TYPE.rookieErp: {
        await this.rookiePrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.rookieCustom: {
        await this.rookiePrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.dyCloud:
      case ENUM_PRINT_PLUGIN_TYPE.dyErp: {
        await this.dyPrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.ksCloud:
      case ENUM_PRINT_PLUGIN_TYPE.ksErp: {
        // 快手建议10条以内
        await this.ksPrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.pddCloud:
      case ENUM_PRINT_PLUGIN_TYPE.pddErp: {
        await this.pddPrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.lodop: {
        await this.lodopPrintPlugin.print(printData);
        // lodop打印条码不阻塞
        // this.printingStatus = false;
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.dw: {
        await this.dwPrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuErp:
      case ENUM_PRINT_PLUGIN_TYPE.xiaoHongShuCloud: {
        await this.xiaoHongShuPrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.vopCloud:
      case ENUM_PRINT_PLUGIN_TYPE.vopErp: {
        await this.rookiePrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.channelsShop: {
        await this.channelsShopPrintPlugin.print(printData);
        break;
      }
      case ENUM_PRINT_PLUGIN_TYPE.aiKuCun: {
        await this.aiKuCunPrintPlugin.print(printData);
        break;
      }
      default:
        this.isFirstPrint = true;
        throw new Error('插件类型不存在,在外部被非法改掉');
    }
  };
}

export const printHelper = new PrintHelper();
