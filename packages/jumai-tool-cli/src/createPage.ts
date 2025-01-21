import inquirer from 'inquirer';
import fs from 'fs';
import { insertLineInFile } from './utils';
import { PAGE_LIST, projectName, cwd } from './constant';
import path from 'path';

export function createNewPage() {
  inquirer
    .prompt([
      {
        type: 'input',
        message: '请输入新增页面名称',
        name: 'name',
        default: 'defaultName',
      },
      {
        type: 'input',
        message: '请输入新增页面标题（中文）',
        name: 'cTitle',
        default: '页面标题',
      },
      {
        type: 'list',
        message: '请选择新增页面类型',
        name: 'type',
        default: PAGE_LIST[0],
        choices: PAGE_LIST,
      },
    ])
    .then((res) => {
    // 复制文件
      const { name, cTitle, type } = res;

      const newPagePath = path.join(cwd, `src/pages/${name}`);

      fs.mkdirSync(newPagePath);

      const templateFilePath = path.join(__dirname, `../templates/${type}`);

      const files = fs.readdirSync(templateFilePath);
      files.forEach((item) => {
        const srcPath = path.join(templateFilePath, item);
        const destPath = path.join(newPagePath, item);
        fs.copyFileSync(srcPath, destPath);
      });

      // 处理路由;
      const newRoute = `      {
        path: '/${projectName}/${name}',
        title: '${cTitle}',
        exact: true,
        component: React.lazy(() => import('./pages/${name}/index')),
      },`;
      const routesPath = path.join(cwd, 'src/routes.tsx');
      insertLineInFile(routesPath, 3, newRoute, true);
    });
}

