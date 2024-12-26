import { defineConfig } from 'dumi';

export default defineConfig({
  title: '衫数pc文档',
  favicons: ['https://hw-front.ejingling.cn/customer-source/common/favicon.ico'],
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
    socialLinks: { gitlab: 'http://192.168.200.111:9980/egFrontend/egenie-utils' },
    logo: 'https://hw-front.ejingling.cn/customer-source/common/favicon.ico',
    nav: [
      {
        title: '基础包',
        link: '/packages/egenie-bundler-cli',
      },
      {
        title: 'egenie-common',
        link: '/egenie-common/helper',
      },
      {
        title: 'egenie-utils',
        link: '/egenie-utils/export',
        children: [
          {
            title: '查询方案',
            link: '/egenie-utils/programme/guide',
          },
          {
            title: '表格',
            link: '/egenie-utils/table/synopsis',
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
