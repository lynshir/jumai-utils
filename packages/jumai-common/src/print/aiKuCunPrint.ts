import { message } from 'antd';
import type { PrintAbstract, CommonPrintParams } from './types';
import { isSocketConnected, handleSocketDisconnectNotification, validateData } from './utils';

type Fn = (...args: any[]) => any;

interface PrintMapItem {
  request: { requestId: string; };
  resolve: Fn;
  reject: Fn;
}

interface PrinterQueueItem {
  request: { esubrc: 'printerInfoQuery'; };
  resolve: Fn;
  reject: Fn;
}

interface Response {
  code?: string;
  message?: string;
  requestId: string;
  taskId: string;
  printers?: Array<{ printName?: string; defaultPrinter?: number; }>;
}

export class AiKuCunPrint implements PrintAbstract {
  constructor(private readonly socketUrl: string, private readonly openError: string) {
  }

  private socket: WebSocket;

  private printTaskRequest = new Map<string, PrintMapItem>();

  private printTaskQueue: Array<PrintMapItem['request']> = [];

  private isConnected = false;

  private sendToPrinter(request: PrintMapItem['request']): Promise<any> {
    this.doConnect();

    return new Promise((resolve, reject) => {
      this.printTaskRequest.set(request.requestId, {
        request,
        resolve,
        reject,
      });

      if (isSocketConnected(this.socket, this.openError)) {
        this.socket.send(JSON.stringify(request));
      } else {
        this.printTaskQueue.push(request);
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

      for (const value of this.printTaskRequest.values()) {
        if (value.reject) {
          value.reject();
        }
      }

      this.printTaskRequest.clear();
      this.printersTaskQueue = [];
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
      const taskQueue = this.printTaskQueue;
      this.printTaskQueue = [];
      taskQueue.forEach((item) => {
        this.socket.send(JSON.stringify(item));
      });

      this.printersTaskQueue.forEach((item) => {
        this.socket.send(JSON.stringify(item.request));
      });
    }
  };

  private onmessage = (event: MessageEvent) => {
    const response: Response = JSON.parse(event.data);
    const isPrint = response.requestId || response.taskId;
    const requestId = response.requestId;
    const requestIdItem = this.printTaskRequest.get(requestId);

    if (response.code === '00000') {
      if (isPrint && requestIdItem) {
        requestIdItem.resolve();
        this.printTaskRequest.delete(requestId);
      } else {
        const printers: string[] = (response.printers || []).map((item) => item.printName);
        this.printersTaskQueue.forEach((item) => item.resolve(printers));
        this.printersTaskQueue = [];
      }
    } else {
      const error = response.message || '打印失败';
      message.error({
        key: error,
        content: error,
      });
      if (isPrint && requestIdItem) {
        requestIdItem.reject(error);
        this.printTaskRequest.delete(requestId);
      } else {
        this.printersTaskQueue.forEach((item) => item.reject(error));
        this.printersTaskQueue = [];
      }
    }
  };

  private printersTaskQueue: PrinterQueueItem[] = [];

  /**
   * 获取打印机列表
   */
  public getPrinters = (): Promise<string[]> => {
    this.doConnect();

    return new Promise((resolve, reject) => {
      const request = { esubrc: 'printerInfoQuery' } as const;
      this.printersTaskQueue.push({
        request,
        resolve,
        reject,
      });

      if (isSocketConnected(this.socket, this.openError)) {
        this.socket.send(JSON.stringify(request));
      }
    });
  };

  /**
   * 打印
   */
  public print = async({ contents }: Pick<CommonPrintParams, 'contents'>): Promise<any> => {
    validateData(contents);
    for (let i = 0; i < contents.length; i++) {
      const item = contents[i];
      if (item?.printMetaData?.printData) {
        await this.sendToPrinter(JSON.parse(item.printMetaData.printData));
      }
    }
  };
}
