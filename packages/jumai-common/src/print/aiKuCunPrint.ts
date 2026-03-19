import { message } from 'antd';
import type { PrintAbstract  } from './types';
import { handleSocketDisconnectNotification, } from './utils';

type Fn = (...args: any[]) => any;

interface PrintMapItem {
  request: { requestId: string };
  resolve: Fn;
  reject: Fn;
}

interface PrinterQueueItem {
  request: { esubrc: 'printerInfoQuery' };
  resolve: Fn;
  reject: Fn;
}

interface Response {
  code?: string;
  message?: string;
  requestId: string;
  taskId: string;
  printers?: Array<{ printName?: string; defaultPrinter?: number }>;
}

export class AiKuCunPrint implements PrintAbstract {
  constructor(private readonly socketUrl: string, private readonly openError: string, private readonly loopPrintCallback: () => void) {}

  private socket: WebSocket;

  private printTaskRequest = new Map<string, PrintMapItem>();

  private isConnected = false;

  private async sendToPrinter(request: PrintMapItem['request']): Promise<any> {
    await this.connectWebsocket();
    return new Promise((resolve, reject) => {
      this.printTaskRequest.set(request.requestId, {
        request,
        resolve,
        reject,
      });

      this.socket.send(JSON.stringify(request));
    });
  }

  private connectWebsocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const initWebsocket = () => {
        if (!this.socket) {
          this.socket = new WebSocket(this.socketUrl);
          console.log(`建立websocket连接,--${this.socketUrl}--,${new Date().toLocaleTimeString()}`);

          // open
          this.socket.onopen = (event) => {
            console.log(`browser onopen event:${JSON.stringify(event)}`);
            this.isConnected = true;
          };

          // 错误
          this.socket.onerror = (event): void => {
            console.log(`browser onerror event:${JSON.stringify(event)}`);
            message.error({
              content: this.openError,
              key: this.openError,
            });

            for (const value of this.printTaskRequest.values()) {
              if (value.reject) {
                value.reject();
              }
            }

            this.printTaskRequest.clear();
            this.loopPrintCallback();
          };

          // 关闭
          this.socket.onclose = (event) => {
            console.log(`browser onclose event:${JSON.stringify(event)}`);
            if (this.isConnected) {
              handleSocketDisconnectNotification();
            }
          };

          // 监听消息
          this.socket.onmessage = this.onmessage;
        } else {
          console.log('打印机websocket, ' + this.socketUrl + '已连接');
        }
        if (this.socket?.readyState === 1) {
          console.log('连接打印机ready, ' + this.socketUrl);
          resolve();
        } else {
          console.log('等待连接打印机');
          setTimeout(() => {
            initWebsocket();
          }, 500);
        }
      };
      initWebsocket();
    });
  };

  private onmessage = (event: MessageEvent) => {
    const response: Response = JSON.parse(event.data);
    const isPrint = response.requestId || response.taskId;
    const requestId = response.requestId;
    const requestIdItem = this.printTaskRequest.get(requestId);

    if (response.code === '00000') {
      if (isPrint && requestIdItem) {
        // this.statusCallback(true);
        requestIdItem.resolve();
        this.printTaskRequest.delete(requestId);
      } else {
        const printers: string[] = (response.printers || []).map((item) => item.printName);
        this.printersTaskQueue.forEach((item) => item.resolve(printers));
        this.printersTaskQueue = [];
        // this.statusCallback(true);
      }
      this.loopPrintCallback();
      // TODO: 到处理code !== '00000' && code !=='200', 既不等于200也不等于00000的情况， 才能当做当做失败处理， 目前没有多打印组件混合用，暂时只用00000。
    } else {
      const error = response.message || '打印失败';
      message.error({
        key: error,
        content: error,
      });
      if (isPrint && requestIdItem) {
        requestIdItem.reject(error);
        this.printTaskRequest.delete(requestId);
        // this.statusCallback(true);
      } else {
        this.printersTaskQueue.forEach((item) => item.reject(error));
        this.printersTaskQueue = [];
      }
      this.loopPrintCallback();
    }
  };

  private printersTaskQueue: PrinterQueueItem[] = [];

  /**
   * 获取打印机列表
   */
  public getPrinters = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const request = { esubrc: 'printerInfoQuery' } as const;
      this.printersTaskQueue.push({
        request,
        resolve,
        reject,
      });
      this.connectWebsocket().then(() => this.socket.send(JSON.stringify(request)));
    });
  };

  /**
   * 打印
   */
  public print = async ({ contents }): Promise<any> => {
    await this.sendToPrinter(contents);
  };
}
