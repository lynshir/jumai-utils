import type { UserConfig } from 'jumai-bundler-cli';
import { theme } from 'jumai-config';

// const target = 'https://cdtestcloudwms.ejingling.cn/';
const target = 'https://cduaterp.jmaihome.cn/';
const context = [
  '/api',
];
const proxy = context.reduce((prev, current) => {
  prev[current] = {
    target,
    changeOrigin: true,
    secure: false,
  };
  return prev;
}, {});

const config: UserConfig = {
  proxy,
  lessOptions: { modifyVars: theme },
  externals: {
    lodash: '_',
    qs: 'Qs',
    axios: 'axios',
    react: 'React',
    'react-dom': 'ReactDOM',
    mobx: 'mobx',
    'mobx-react': 'mobxReact',
    'mobx-react-lite': 'mobxReactLite',
    moment: 'moment',
    echarts: 'echarts',
  },
};
export default config;
