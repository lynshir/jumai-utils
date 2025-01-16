import { defineConfig } from 'dumi';

export default defineConfig({
  title: '衫数pc文档',
  favicons: ['https://front.jmaihome.cn/customer-source/common/favicon.ico'],
  outputPath: 'docs-dist',
  hash: true,
  themeConfig: {
    name: 'pc文档',
    showLineNum: true,
    footer: false,
    prefersColor: {
      default: 'dark',
      switch: true,
    },
    socialLinks: { gitlab: 'http://192.168.200.111:9980/egFrontend/jumai-utils' },
    logo: 'https://front.jmaihome.cn/customer-source/common/favicon.ico',
    nav: [
      {
        title: '基础包',
        link: '/packages/jumai-bundler-cli',
      },
      {
        title: 'jumai-common',
        link: '/jumai-common/helper',
      },
      {
        title: 'jumai-utils',
        link: '/jumai-utils/export',
        children: [
          {
            title: '查询方案',
            link: '/jumai-utils/programme/guide',
          },
          {
            title: '表格',
            link: '/jumai-utils/table/synopsis',
          },
        ],
      },
      {
        title: '重要更新',
        link: '/important-change/0-1-28',
      },
    ],
  },
});
