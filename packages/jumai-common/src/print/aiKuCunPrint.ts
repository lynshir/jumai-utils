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

interface PushBackMessage {
  logisticsNo?: string;
  requestId?: string;
  taskId?: string;
  message?: string;
}

/** 爱库存控件回包：requestId/taskId 在 pushBackMessage 内，不在顶层 */
interface AiKuCunWsPayload {
  code?: string;
  message?: string;
  pushBackMessage?: PushBackMessage;
  requestId?: string;
  taskId?: string;
  printers?: Array<{ printName?: string; defaultPrinter?: number }>;
}

function normalizeAiKuCunIds(payload: AiKuCunWsPayload): { requestId?: string; taskId?: string } {
  const inner = payload.pushBackMessage;
  return {
    requestId: inner?.requestId ?? payload.requestId,
    taskId: inner?.taskId ?? payload.taskId,
  };
}

/** 单条打印完成后延迟再拉下一条，避免控件/驱动跟不上连发丢任务（可按现场调大） */
const AI_KUCUN_PRINT_JOB_INTERVAL_MS = 220;

export class AiKuCunPrint implements PrintAbstract {
  constructor(private readonly socketUrl: string, private readonly openError: string, private readonly loopPrintCallback: () => void) {}

  private socket: WebSocket;

  private printTaskRequest = new Map<string, PrintMapItem>();

  private isConnected = false;

  /** 仅在有打印任务结束（成功/失败）时延迟，避免与上一条间隔过短；查打印机列表仍立即推进 */
  private scheduleLoopPrintCallback = (afterPrintJob: boolean) => {
    if (afterPrintJob) {
      setTimeout(() => this.loopPrintCallback(), AI_KUCUN_PRINT_JOB_INTERVAL_MS);
    } else {
      this.loopPrintCallback();
    }
  };

  private async sendToPrinter(request: PrintMapItem['request']): Promise<any> {
    await this.connectWebsocket();
    return new Promise((resolve, reject) => {
      const mapKey = String(request.requestId);
      this.printTaskRequest.set(mapKey, {
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
    let response: AiKuCunWsPayload;
    try {
      response = JSON.parse(event.data) as AiKuCunWsPayload;
    } catch {
      return;
    }

    const { requestId, taskId } = normalizeAiKuCunIds(response);
    const lookupKey = requestId ?? taskId;
    const requestIdItem = lookupKey != null ? this.printTaskRequest.get(String(lookupKey)) : undefined;
    const code = response.code != null ? String(response.code) : '';

    // 中间态：任务已受理但未出纸完成，不 resolve、不推进打印队列
    if (code === '00000') {
      return;
    }

    if (code === '200') {
      if (requestIdItem && lookupKey != null) {
        requestIdItem.resolve();
        this.printTaskRequest.delete(String(lookupKey));
        this.scheduleLoopPrintCallback(true);
      } else {
        const printers: string[] = (response.printers || []).map((item) => item.printName);
        this.printersTaskQueue.forEach((item) => item.resolve(printers));
        this.printersTaskQueue = [];
        this.scheduleLoopPrintCallback(false);
      }
      return;
    }

    if (code !== '200' && code !== '00000') {
      const error = response.message || '打印失败';
      message.error({
        key: error,
        content: error,
      });
      if (requestIdItem && lookupKey != null) {
        requestIdItem.reject(error);
        this.printTaskRequest.delete(String(lookupKey));
        this.scheduleLoopPrintCallback(true);
      } else {
        this.printersTaskQueue.forEach((item) => item.reject(error));
        this.printersTaskQueue = [];
        this.scheduleLoopPrintCallback(false);
      }
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
