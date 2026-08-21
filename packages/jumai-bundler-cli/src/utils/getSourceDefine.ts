import type { Env, UserConfig } from '../types';
import { getProcessEnv } from './getProcessEnv';

export function getSourceDefine({
  userEnv,
  publicPath,
  env,
  processEnvPrefix,
  define,
}: {
  userEnv: Record<string, string>;
  publicPath: UserConfig['publicPath'];
  env: Env;
  processEnvPrefix: UserConfig['processEnvPrefix'];
  define?: UserConfig['define'];
}): Record<string, string> {
  const processEnvOptions = getProcessEnv(userEnv, publicPath, env, processEnvPrefix);
  const result: Record<string, string> = {
    'process.env': JSON.stringify(processEnvOptions),
    global: 'window',
  };

  Object.keys(processEnvOptions)
    .forEach((key) => {
      result[`process.env.${key}`] = JSON.stringify(processEnvOptions[key]);
    });

  if (define) {
    Object.keys(define)
      .forEach((key) => {
        result[key] = JSON.stringify(define[key]);
      });
  }

  return result;
}

export function getDefinePluginConfig(options: Parameters<typeof getSourceDefine>[0]): Record<string, string> {
  return getSourceDefine(options);
}
