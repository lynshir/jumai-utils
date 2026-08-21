import { createRsbuild, logger } from '@rsbuild/core';
import { config } from './configRsbuild/config';
import type { RsbuildBuildOptions } from './types';
import { Env } from './types';

export async function buildRsbuild({
  cwd,
  userConfig = {},
  userEnv,
  entry,
}: RsbuildBuildOptions & { entry: Record<string, string>; }) {
  const rsbuildConfig = config({
    env: Env.production,
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

  try {
    const result = await rsbuild.build({
      watch: !!userConfig.watch,
    });
    await result.close();
  } catch (err) {
    logger.error('Failed to build with Rsbuild.');
    logger.error(err);
    process.exit(1);
  }
}
