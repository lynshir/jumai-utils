import postcssFlexbugsFixes from 'postcss-flexbugs-fixes';
import postcssPresetEnv from 'postcss-preset-env';
import type { pluginOptions } from 'postcss-preset-env';
import postcss from 'postcss';
import Px2rem from 'px2rem';

function px2remPlugin(options: GetPostcssConfigOptions['px2rem']) {
  return {
    postcssPlugin: 'postcss-px2rem',
    Once: (css, { result }) => {
      const oldCssText = css.toString();
      const px2remIns = new Px2rem(options);
      const newCssText = px2remIns.generateRem(oldCssText);
      result.root = postcss.parse(newCssText);
    },
  };
}

export interface GetPostcssConfigOptions {
  browsers?: string[];
  postcssOptions?: { plugins: never; } & Record<string, any>;
  postcssPresetEnvOptions?: { autoprefixer?: never; } & pluginOptions;
  autoprefixer?: pluginOptions['autoprefixer'];
  extraPostCSSPlugins?: any[];
  px2rem?: { remUnit?: number; } & Record<string, any>;
}

export function getPostcssConfig({
  browsers,
  postcssPresetEnvOptions,
  autoprefixer,
  extraPostCSSPlugins,
  postcssOptions,
  px2rem,
}: GetPostcssConfigOptions = {}) {
  return {
    ident: 'postcss',
    plugins: [
      postcssFlexbugsFixes,
      postcssPresetEnv({
        browsers,
        autoprefixer: {
          remove: false,
          flexbox: 'no-2009',
          ...autoprefixer,
        },
        stage: 3,
        ...postcssPresetEnvOptions,
      } as pluginOptions),
      px2rem && px2rem.remUnit && px2remPlugin(px2rem),
    ].filter(Boolean)
      .concat(extraPostCSSPlugins || []),
    ...postcssOptions,
  };
}
