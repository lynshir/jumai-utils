import { createRsbuild } from '@rsbuild/core';
import { config } from './configRsbuild/config';
import type { RsbuildDevOptions } from './types';

export async function devRsbuild({
  env,
  cwd,
  userConfig = {},
  userEnv,
  entry,
}: RsbuildDevOptions & { entry: Record<string, string>; }) {
  const rsbuildConfig = config({
    env,
    cwd,
    userConfig,
    userEnv,
    entry,
  });

  const rsbuild = await createRsbuild({
    cwd,
    callerName: 'jumai-bundler-cli',
    loadEnv: false,
    config: rsbuildConfig,
  });

  await rsbuild.startDevServer();
}
