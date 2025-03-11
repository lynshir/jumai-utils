import { message } from 'antd';
import type { PrintAbstract, CommonPrintParams } from './types';
import { getUUID, handleSocketDisconnectNotification, validateData } from './utils';

interface RequestProtocol {
  command: string;
  requestID: string;
  printer?: string;

  [key: string]: any;
}

interface Response {
  requestID: string;
  command: 'getPrinterList' | 'print';
  printerList?: Array<{
    name: string;
    displayName: string;
  }>;
  results?: Array<{ taskID?: string; ewaybillOrderID?: string; success?: boolean; failureReason?: string; }>;
}

export class ChannelsShopPrint implements PrintAbstract {
  constructor(private readonly socketUrl: string, private readonly openError: string, private readonly statusCallback: (isSuccess: boolean) => void) {
  }

  private socket: WebSocket;

  private taskRequest = new Map<string, { request: RequestProtocol; resolve?: (...args: any[]) => any; reject?: (...args: any[]) => any; }>();

  private isConnected = false;

  private async sendToPrinter(request: RequestProtocol): Promise<any> {
    await this.connectWebsocket();

    return new Promise((resolve, reject) => {
      this.taskRequest.set(request.requestID, {
        request,
        resolve,
        reject,
      });

      this.socket.send(JSON.stringify(request));
    });
  }

  public connectWebsocket = (): Promise<void> => {
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

            for (const value of this.taskRequest.values()) {
              if (value.reject) {
                value.reject();
              }
            }
            this.taskRequest.clear();
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
          console.log('打印机websocket ' + this.socketUrl + '已连接');
        }
        if (this.socket?.readyState === 1) {
          console.log('连接打印机ready, ' + this.socketUrl);
          resolve();
        } else {
          console.log('等待连接打印机, ' + this.socketUrl);
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
    const requestIDItem = this.taskRequest.get(response.requestID);

    if (response.command === 'getPrinterList' && requestIDItem) {
      this.statusCallback(true);
      requestIDItem.resolve((response.printerList || []).map((item) => item.name));
      this.taskRequest.delete(response.requestID);
    } else if (response.command === 'print' && requestIDItem) {
      const results = response.results || [];
      const errorItem = results.find((item) => !item.success);
      if (errorItem) {
        requestIDItem.reject(errorItem.failureReason);
        message.error(errorItem.failureReason || '打印失败');
      } else {
        this.statusCallback(true);
        requestIDItem.resolve();
      }
      this.taskRequest.delete(response.requestID);
    }
  };

  /**
   * 获取打印机列表
   */
  public getPrinters = (): Promise<string[]> => {
    return this.sendToPrinter({
      requestID: getUUID(),
      command: 'getPrinterList',
    });
  };

  /**
   * 打印
   */
  public print = async({
    contents,
    printer,
  }: CommonPrintParams): Promise<any> => {
    validateData(contents);
    await this.sendToPrinter({
      command: 'print',
      requestID: getUUID(),
      version: '2.0',
      taskList: contents,
      printer,
    });
  };
}
