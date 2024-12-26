import type { WebpackApplyOptions } from '../types';
import SentryWebpackPlugin from '@sentry/webpack-plugin';
import path from 'path';

export function sentryPlugin({
  config,
  userConfig: {
    outputPath,
    publicPath,
  },
  isDevelopment,
  cwd,
}: WebpackApplyOptions) {
  if (!isDevelopment && process.env.REACT_APP_SENTRY_DSN && process.env.REACT_APP_API_VERSION) {
    config.plugin('@sentry/webpack-plugin')
      .use(SentryWebpackPlugin, [
        {
          release: process.env.REACT_APP_API_VERSION,
          include: path.resolve(cwd, outputPath),
          urlPrefix: publicPath,
        },
      ]);
  }
}
