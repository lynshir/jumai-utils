import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

function getEnvironment(): string {
  // uat环境从host判断
  if (location.host.includes('uat')) {
    return 'uat';
  }

  const result = /ResourceType=([^\s;]+)/.exec(document.cookie);
  if (!result) {
    return 'unknown';
  }

  // 线上分灰度和正式,兼容sentry默认的production
  if (result[1] === 'gray') {
    return 'gray';
  } else {
    return 'production';
  }
}

export function init(dsn: string, release: string) {
  if (dsn && release) {
    Sentry.init({
      ignoreErrors: [
        /ResizeObserver loop/i,
        /exception captured with keys/i,
        /Loading chunk/i,
        /Loading CSS chunk/i,
        /Network Error/i,
        /Network request failed/i,
        /\[mobx.array] Index out of bounds/i,
        /too much recursion/i,
        /Maximum call stack size exceeded/i,
        /KISSY is not defined/i,
        /b.apply is not a function/i,
      ],
      environment: getEnvironment(),
      dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      release,
      beforeSend(event, hint) {
        Sentry.setUser({
          // @ts-ignore
          id: window?.top?.user?.id,

          // @ts-ignore
          username: window?.top?.user?.username,
        });

        // 过滤错误
        const filterLevel = [
          'warning',
          'log',
          'info',
          'debug',
        ].includes(event?.level);

        const filterMechanism = event?.exception?.values?.some((item) => [
          'onunhandledrejection',
          'logging',
          'generic',
        ].includes(item?.mechanism?.type));

        if (filterLevel || filterMechanism) {
          return null;
        }

        return event;
      },
      initialScope: {
        user: {
          // @ts-ignore
          id: window?.top?.user?.id,

          // @ts-ignore
          username: window?.top?.user?.username,
        },
      },
    });
  }
}

const element: HTMLDivElement = document.querySelector('#jumai-sentry');
const dsn = element?.dataset?.dsn;
const release = element?.dataset?.release;
const timeout = Number(element?.dataset?.timeout) >>> 0;

if (timeout > 0) {
  setTimeout(() => init(dsn, release), timeout);
} else {
  init(dsn, release);
}
