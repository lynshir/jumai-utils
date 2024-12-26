import cac from 'cac';
import { createNewPage } from './createPage';
import { changeEnv } from './changeEnv';
import { version } from './constant';

const cli = cac('egenie-tool-cli');

cli.version(version);

cli
  .command('createPage', '新建页面和路由')
  .action((root, options) => {
    createNewPage();
  });

cli
  .command('changeEnv', '选择开发环境')
  .action((root, options) => {
    changeEnv();
  });

cli.help();
cli.parse();
