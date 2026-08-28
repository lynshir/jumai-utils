import { mergeRsbuildConfig, rspack, type RsbuildConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import { getPostcssConfig } from 'jumai-postcss-preset';
import path from 'path';
import { DEFAULT_SRC_DIR, LOCAL_IDENT_NAME } from '../constants';
import type { RsbuildConfigOptions } from '../types';
import { CodeSplit, CSSMinifier, Env, JSMinifier } from '../types';
import { getBrowsersList } from '../utils/getBrowsersList';
import { getProcessEnv } from '../utils/getProcessEnv';
import { getSourceDefine } from '../utils/getSourceDefine';
import { getWorkspaceIncludes, getWorkspaceSourceAliases } from '../utils/getWorkspaceIncludes';
import { createAutoCSSModulesRule } from './createAutoCSSModulesRule';
import { getGranularSplitChunks } from './getGranularSplitChunks';

export function config({
  env,
  cwd,
  userConfig,
  userEnv,
  entry,
}: RsbuildConfigOptions & { entry: Record<string, string>; }): RsbuildConfig {
  const isDevelopment = env === Env.development;
  const {
    host,
    port,
    open,
    define,
    publicPath,
    alias,
    targets,
    assetsInlineLimit,
    outputPath,
    proxy,
    cache,
    publicDir,
    lessOptions,
    autoprefixer,
    postcssPresetEnvOptions,
    extraPostCSSPlugins,
    postcssOptions,
    px2rem,
    processEnvPrefix,
    externals,
    autoCSSModules,
    ignoreMomentLocale,
    extraJsModuleIncludes,
    staticPathPrefix,
    sourcemap,
    codeSplitting,
    nocompress,
    jsMinifier,
    cssMinifier,
    rsbuild,
  } = userConfig;

  const srcDir = path.resolve(cwd, DEFAULT_SRC_DIR);
  const processEnv = getProcessEnv(userEnv, publicPath, env, processEnvPrefix);
  const sourceDefine = getSourceDefine({
    userEnv,
    publicPath,
    env,
    processEnvPrefix,
    define,
  });

  const jsSourceMap = isDevelopment
    ? 'cheap-module-source-map'
    : sourcemap === false
      ? false
      : typeof sourcemap === 'string'
        ? sourcemap
        : 'source-map';

  const defaultConfig: RsbuildConfig = {
    mode: isDevelopment ? 'development' : 'production',
    plugins: [
      pluginReact(),
      pluginLess({
        lessLoaderOptions: {
          lessOptions,
        },
      }),
    ],
    source: {
      entry,
      decorators: {
        version: 'legacy',
      },
      define: sourceDefine,
      include: getWorkspaceIncludes(cwd, extraJsModuleIncludes),
    },
    resolve: {
      alias: {
        ...getWorkspaceSourceAliases(cwd),
        ...alias,
      },
    },
    html: {
      template: path.resolve(cwd, `${publicDir}/index.html`),
      templateParameters: {
        process: {
          env: processEnv,
        },
      },
    },
    output: {
      assetPrefix: publicPath,
      distPath: isDevelopment ? {
        root: outputPath,
        js: '',
        jsAsync: 'async',
        css: '',
      } : {
        root: outputPath,
        js: '',
        jsAsync: 'async',
        css: '',
        image: staticPathPrefix,
        svg: staticPathPrefix,
        font: staticPathPrefix,
        media: staticPathPrefix,
        assets: staticPathPrefix,
      },
      dataUriLimit: assetsInlineLimit,
      externals,
      cssModules: autoCSSModules === false ? {
        auto: false,
      } : {
        auto: createAutoCSSModulesRule(srcDir),
        localIdentName: LOCAL_IDENT_NAME,
        exportLocalsConvention: 'asIs',
      },
      overrideBrowserslist: getBrowsersList(targets),
      sourceMap: {
        js: jsSourceMap as any,
        css: jsSourceMap !== false,
      },
      filenameHash: !isDevelopment,
      minify: !isDevelopment && !nocompress ? {
        js: jsMinifier !== JSMinifier.none,
        css: cssMinifier !== CSSMinifier.none,
      } : false,
    },
    server: isDevelopment ? {
      host,
      port,
      open,
      proxy: proxy as RsbuildConfig['server']['proxy'],
      publicDir: {
        name: path.resolve(cwd, publicDir),
      },
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': [
          'GET',
          'HEAD',
          'PUT',
          'POST',
          'PATCH',
          'DELETE',
          'OPTIONS',
        ].join(', '),
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    } : undefined,
    dev: isDevelopment ? {
      assetPrefix: publicPath,
      hmr: true,
    } : undefined,
    performance: {
      buildCache: {
        cacheDirectory: path.resolve(cwd, cache.cacheDirectory),
      },
    },
    splitChunks: !isDevelopment && codeSplitting === CodeSplit.granularChunks
      ? getGranularSplitChunks()
      : undefined,
    tools: {
      // 显式指定 postcss 8，避免 pnpm 下被 stylelint 等依赖的 postcss@7 污染解析
      postcss: () => ({
        implementation: require.resolve('postcss', {
          paths: [require.resolve('jumai-postcss-preset')],
        }),
        postcssOptions: getPostcssConfig({
          browsers: getBrowsersList(targets),
          autoprefixer,
          postcssPresetEnvOptions,
          extraPostCSSPlugins,
          postcssOptions,
          px2rem,
        }),
      }),
      rspack: (config, { appendPlugins }) => {
        config.externalsType = 'window';

        appendPlugins([
          new rspack.ProvidePlugin({
            process: require.resolve('process/browser.js'),
          }),
          new rspack.DefinePlugin(sourceDefine),
        ]);

        if (ignoreMomentLocale !== false) {
          appendPlugins([
            new rspack.IgnorePlugin({
              resourceRegExp: /^\.\/locale$/,
              contextRegExp: /moment$/,
            }),
          ]);
        }

        if (!isDevelopment) {
          config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
            chunkIds: 'deterministic',
            runtimeChunk: 'single',
            concatenateModules: true,
          };
        }

        return config;
      },
    },
  };

  return mergeRsbuildConfig(defaultConfig, rsbuild || {});
}
