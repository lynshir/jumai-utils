import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import readline from 'readline';
import { cwd, userConfigFile, projectName, tempUserConfig } from './constant';
import { hasAnnotation, findTarget, getSelectList, insertLineInFile } from './utils';

const configFile = path.join(cwd, userConfigFile);
const SelectList = getSelectList(projectName);

export function changeEnv() {
  inquirer
    .prompt({
      type: 'list',
      message: '请选择开发环境',
      name: 'env',
      default: SelectList[0],
      choices: SelectList,
    })
    .then((res) => {
      const { env } = res;
      if (env !== 'custom') {
        modifyEnvFile(env);
      } else {
        inquirer.prompt([
          {
            type: 'input',
            message: '请输入目标环境',
            name: 'target',
          },
        ]).then((res) => {
          const { target } = res;
          modifyEnvFile(target);
        });
      }
    });
}

function modifyEnvFile(realTarget) {
  const targets = SelectList.map((item) => item.value).filter((item) => item !== 'custom');

  const realIndex = targets.findIndex((item) => item === realTarget);

  if (realIndex !== -1) {
    targets.splice(realIndex, 1);
  }

  const fRead = fs.createReadStream(configFile);
  const fWrite = fs.createWriteStream(tempUserConfig);

  const rl = readline.createInterface({
    input: fRead,
    output: fWrite,
  });

  // bundlerConfig文件中有目标环境
  let hasTarget = false;

  rl.on('line', (line) => {
    const otherTarget = findTarget(targets, line);
    let eachLine = '';

    // 目标环境
    if (line.includes(realTarget)) {
      hasTarget = true;
      if (hasAnnotation(line)) {
        eachLine = `const target = '${realTarget}';`;
      } else {
        eachLine = line;
      }
    } else if (otherTarget && !hasAnnotation(line)) {
      // 非目标环境没有注释
      eachLine = `// const target = '${otherTarget}';`;
    } else {
      eachLine = line;
    }

    fWrite.write(`${eachLine}\n`);
  });

  rl.on('close', () => {
    // 新增环境
    if (!hasTarget) {
      insertLineInFile(tempUserConfig, 3, `\nconst target = '${realTarget}';\n`);
    }
    dealUserFile();
    console.log(`已切换至${realTarget}环境`);
  });
}

function dealUserFile() {
  fs.unlinkSync(configFile);
  fs.renameSync(tempUserConfig, `./${ userConfigFile}`);
}
