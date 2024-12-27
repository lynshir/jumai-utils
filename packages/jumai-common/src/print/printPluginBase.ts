import { message } from 'antd';
import type { PrintAbstract, CommonPrintParams } from './types';
import { getUUID, isSocketConnected, handleSocketDisconnectNotification, validateData } from './utils';

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

  // 得物预览
  previewUrl?: string;
  msg?: string;
  printers?: Array<{ name?: string; }>;
  printStatus?: Array<{ msg?: string; }>;
  previewImage?: string[];
}

export class PrintPluginBase implements PrintAbstract {
  constructor(private readonly socketUrl: string, private readonly openError: string) {
  }

  private socket: WebSocket;

  // eslint-disable-next-line @typescript-eslint/ban-types
  private taskRequest = new Map<string, { request: RequestProtocol; resolve?: Function; reject?: Function; }>();

  private taskQueue: RequestProtocol[] = [];

  private isConnected = false;

  private sendToPrinter(request: RequestProtocol): Promise<any> {
    this.doConnect();

    return new Promise((resolve, reject) => {
      this.taskRequest.set(request.requestID, {
        request,
        resolve,
        reject,
      });

      if (isSocketConnected(this.socket, this.openError)) {
        this.socket.send(JSON.stringify(request));
      } else {
        this.taskQueue.push(request);
      }
    });
  }

  private doConnect = () => {
    if (this.socket) {
      return;
    }

    this.socket = new WebSocket(this.socketUrl);

    // open
    this.socket.onopen = (event) => {
      console.log(`browser onopen event:${JSON.stringify(event)}`);
      this.isConnected = true;
      this.refresh();
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
  };

  private refresh = () => {
    if (isSocketConnected(this.socket, this.openError)) {
      const taskQueue = this.taskQueue;
      this.taskQueue = [];
      taskQueue.forEach((item) => {
        this.socket.send(JSON.stringify(item));
      });
    }
  };

  private onmessage = (event: MessageEvent) => {
    const response: Response = JSON.parse(event.data);
    const requestIDItem = this.taskRequest.get(response.requestID);

    if (response.cmd === 'getPrinters' && requestIDItem) {
      requestIDItem.resolve((response.printers || []).map((item) => item.name));
      this.taskRequest.delete(response.requestID);
    } else if (response.cmd === 'print') {
      if (response.status === 'success') {
        const previewUrls: string[] = [].concat(response.previewURL || response?.previewImage).filter(Boolean);
        if (previewUrls.length) {
          previewUrls.forEach((previewUrl) => window.open(previewUrl));
        }

        if (requestIDItem) {
          requestIDItem.resolve(previewUrls);
        }
      } else {
        const msg = response?.msg ?? '请求失败';
        message.error(msg);

        if (requestIDItem) {
          requestIDItem.reject(msg);
        }
      }
      this.taskRequest.delete(response.requestID);

      // 得物预览
    } else if (response.cmd === 'preview') {
      const previewUrl = response.previewUrl;
      if (previewUrl) {
        window.open(previewUrl);
      }

      if (requestIDItem) {
        requestIDItem.resolve(previewUrl);
      }
      this.taskRequest.delete(response.requestID);
    } else if (response.cmd === 'notifyPrintResult' || response.cmd === 'PrintResultNotify') {
      if (response.status === 'failed') {
        const msg = response?.printStatus?.[0]?.msg || response?.msg || '请求失败';
        message.error(msg);
      } else if (response.previewURL) {
        window.open(response.previewURL);
      }
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
  public print = async({
    preview,
    contents,
    printer,
    previewType = 'pdf',
    cmd,

    // 得物预览和其它有所区别
    // eslint-disable-next-line require-await
  }: CommonPrintParams & { cmd?: 'preview'; }): Promise<any> => {
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
