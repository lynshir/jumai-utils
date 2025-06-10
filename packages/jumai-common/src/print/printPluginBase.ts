import { message } from 'antd';
import type { PrintAbstract, CommonPrintParams } from './types';
import { getUUID, handleSocketDisconnectNotification, validateData } from './utils';

interface RequestProtocol {
  cmd: string;
  version: string;
  requestID: string;

  [key: string]: any;
}

interface Response {
  requestID: string;
  cmd: 'getPrinters' | 'print' | 'notifyPrintResult' | 'PrintResultNotify' | 'preview';
  status: 'success' | 'failed';
  previewURL?: string;
  taskStatus?: 'failed' | 'printed' | 'partPrinted' | 'rendered'; // 打印任务状态
  // 得物预览
  previewUrl?: string;
  msg?: string;
  printers?: Array<{ name?: string }>;
  printStatus?: Array<{ msg?: string }>;
  previewImage?: string[];
}

export class PrintPluginBase implements PrintAbstract {
  constructor(private readonly socketUrl: string, private readonly openError: string, private readonly loopPrintCallback: () => void) {}

  private socket: WebSocket;

  // eslint-disable-next-line @typescript-eslint/ban-types
  private taskRequest = new Map<string, { request: RequestProtocol; resolve?: Function; reject?: Function }>();

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
            console.log(`browser onopen event:${JSON.stringify(event)}-连接打印机成功，${new Date().toLocaleTimeString()}`);
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
          console.log('已有this.socket, ' + this.socketUrl);
        }
        if (this.socket?.readyState === 1) {
          console.log('打印机ready, ' + this.socketUrl);
          resolve();
        } else {
          console.log('打印机还未连接成功，等待连接打印机');
          setTimeout(() => {
            initWebsocket();
          }, 300);
        }
      };
      initWebsocket();
    });
  };

  private onmessage = (event: MessageEvent) => {
    const response: Response = JSON.parse(event.data);
    const requestIDItem = this.taskRequest.get(response.requestID);

    if (response.cmd === 'getPrinters' && requestIDItem) {
      requestIDItem.resolve((response.printers || []).map((item) => item.name));
      this.taskRequest.delete(response.requestID);
      this.loopPrintCallback();
      return;
    }
    if (response.cmd === 'print') {
      console.log('print', response.status);
      if (response.status === 'success') {
        const previewUrls: string[] = [].concat(response.previewURL || response?.previewImage).filter(Boolean);
        if (previewUrls.length) {
          previewUrls.forEach((previewUrl) => window.open(previewUrl));
        }

        if (requestIDItem) {
          requestIDItem.resolve(previewUrls);
        }
      } else {
        this.loopPrintCallback();
        const msg = response?.msg ?? '请求失败';
        message.error(msg);

        if (requestIDItem) {
          requestIDItem.reject(msg);
        }
      }
      this.taskRequest.delete(response.requestID);

      // 得物预览
    } else if (response.cmd === 'preview') {
      console.log('预览');
      const previewUrl = response.previewUrl;
      if (previewUrl) {
        window.open(previewUrl);
      }

      if (requestIDItem) {
        requestIDItem.resolve(previewUrl);
      }
      this.taskRequest.delete(response.requestID);
      this.loopPrintCallback();
    } else if (response.cmd === 'notifyPrintResult' || response.cmd === 'PrintResultNotify') {
      console.log(response?.cmd, '-', response?.taskStatus, response?.status, '-响应参数', response);
      // const taskStatus = response?.taskStatus;
      // if (taskStatus === 'printed' || taskStatus === 'partPrinted' || taskStatus === 'rendered') {
      //   this.loopPrintCallback();
      // }
      this.loopPrintCallback();
      if (response.status === 'failed') {
        const msg = response?.printStatus?.[0]?.msg || response?.msg || '请求失败';
        message.error(msg);
      } else if (response.previewURL) {
        window.open(response.previewURL);
      }
    } else {
      console.log('进度兜底', response);
      this.loopPrintCallback();
    }
  };

  /**
   * 获取打印机列表
   */
  public getPrinters = (): Promise<string[]> => {
    return this.sendToPrinter({
      requestID: getUUID(),
      version: '1.0',
      cmd: 'getPrinters',
    });
  };

  /**
   * 打印
   */
  public print = async (
    {
      preview,
      contents,
      printer,
      previewType = 'pdf',
      cmd,
    }: // 得物预览和其它有所区别
    // eslint-disable-next-line require-await
    CommonPrintParams & { cmd?: 'preview' },
    isDelay = false,
  ): Promise<any> => {
    validateData(contents);
    return this.sendToPrinter({
      cmd: cmd || 'print',
      requestID: getUUID(),
      version: '1.0',
      task: {
        taskID: getUUID(),
        documents: contents,
        printer,

        // 快手无此字段
        preview: Boolean(preview),
        previewType,
        notifyType: ['render'],
      },
    });
  };
}
