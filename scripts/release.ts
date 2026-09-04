// 导入 Node.js 内置的 assert 模块，用于断言测试
import assert from 'assert';

// 导入 git-repo-info 库，用于获取 Git 仓库信息
import getGitRepoInfo from 'git-repo-info';

// 导入 zx 库的 globals，用于执行 shell 命令
import 'zx/globals';

// 导入 chalk 库，用于终端颜色输出
import chalk from 'chalk';

// 导入 Node.js 内置的 fs 模块，用于文件系统操作
import fs from 'fs';

// 导入 Node.js 内置的 path 模块，用于路径操作
import path from 'path';

// 获取当前工作目录的绝对路径
const cwd = fs.realpathSync(process.cwd());

// 定义要发布的 NPM 仓库地址
const publishRegistry = 'https://registry.npmjs.org/';

// 定义构建命令
const buildCmd = 'build';

// 定义测试命令
const testCmd = 'test';

// 定义 PackageJsonInfo 接口，描述 package.json 文件的结构
interface PackageJsonInfo {
  name?: string; // 包名
  private?: boolean; // 是否为私有包
  version?: string; // 版本号
}

// 定义 PublishPackagesInfo 接口，描述要发布的包信息
interface PublishPackagesInfo {
  filename: string; // 包目录名
  packagePath: string; // 包的完整路径
  packageJson: PackageJsonInfo; // 包的 package.json 内容
}

// 更新生成器模板中包的版本号
async function updateGeneratorPackages(version: string) {
  // 定义要更新的生成器模板路径和需要更新的依赖
  const data = [
    {
      // 第一个生成器模板路径
      generatorTplPath: path.resolve(cwd, 'packages/generator-jumai-react-h5/generators/app/templates/package.json.tpl'),

      // 需要更新的 dependencies 依赖
      updateDependencies: [],

      // 需要更新的 devDependencies 依赖
      updateDevDependencies: [
        'jumai-bundler-cli',
        'jumai-code-style',
      ],
    },
    {
      // 第二个生成器模板路径
      generatorTplPath: path.resolve(cwd, 'packages/generator-jumai-react-web/generators/app/templates/package.json.tpl'),

      // 需要更新的 dependencies 依赖
      updateDependencies: [
        'jumai-utils',
        'jumai-common',
      ],

      // 需要更新的 devDependencies 依赖
      updateDevDependencies: [
        'jumai-bundler-cli',
        'jumai-code-style',
        'jumai-config',
      ],
    },
  ];

  // 并行更新所有模板文件
  await Promise.all(data.map(async(item) => {
    // 读取模板文件内容
    const oldDataStr = await fs.promises.readFile(item.generatorTplPath, 'utf8');

    // 解析 JSON 数据
    const oldDataJson = JSON.parse(oldDataStr);

    // 更新 dependencies 中的版本号
    item.updateDependencies.forEach((value) => {
      oldDataJson.dependencies[value] = version;
    });

    // 更新 devDependencies 中的版本号
    item.updateDevDependencies.forEach((value) => {
      oldDataJson.devDependencies[value] = version;
    });

    // 将更新后的 JSON 写回文件
    await fs.promises.writeFile(item.generatorTplPath, JSON.stringify(oldDataJson, null, 2));
  }));
}

// 获取要发布的包信息
async function getPublishPackagesInfo(): Promise<PublishPackagesInfo[]> {
  // 获取 packages 目录路径
  const packagesPath = path.resolve(cwd, 'packages');

  // 读取 packages 目录下的所有文件/文件夹
  const files = await fs.promises.readdir(packagesPath);

  // 初始化结果数组
  const result: PublishPackagesInfo[] = [];

  // 遍历所有文件/文件夹
  for (let i = 0; i < files.length; i++) {
    // 构建包路径
    const packagePath = path.resolve(packagesPath, files[i]);

    // 构建 package.json 路径
    const packageJsonPath = path.resolve(packagePath, 'package.json');

    // 检查是否存在 package.json 文件
    if (fs.existsSync(packageJsonPath)) {
      // 读取并解析 package.json 文件
      const content: PackageJsonInfo = require(packageJsonPath);

      // 检查是否不是私有包（private !== true）
      if (content.private !== true) {
        // 将包信息添加到结果数组
        result.push({
          filename: files[i], // 包目录名
          packagePath, // 包的完整路径
          packageJson: content, // 包的 package.json 内容
        });
      }
    }
  }

  // 返回包信息数组
  return result;
}

// 根据版本号获取 NPM 标签
function getNpmTag(version: string) {
  // 定义版本号正则表达式，匹配标准版本号格式
  const checkVersionReg = /^\d+\.\d+\.\d+(-(alpha|beta|rc)\.\d+){0,1}$/;

  // 检查版本号是否符合规范
  if (!checkVersionReg.test(version)) {
    // 如果不符合规范，抛出错误
    const error = '版本不符合规范';
    throw new Error(error);
  }

  // 如果版本号包含 alpha、beta 或 rc，则返回 next 标签
  if (/alpha|beta|rc/.test(version)) {
    return 'next';
  }

  // 否则返回 latest 标签
  return 'latest';
}

// 判断发布错误是否为 OTP 失效/错误（TOTP 约 30s 过期，monorepo 连发很容易中途 EOTP）
function isOtpError(error: unknown) {
  const text = [
    error instanceof Error ? error.message : String(error),
    // zx ProcessOutput
    (error as { stderr?: string; stdout?: string })?.stderr,
    (error as { stderr?: string; stdout?: string })?.stdout,
  ].filter(Boolean)
    .join('\n');
  return /EOTP|one-time password|otp/i.test(text);
}

// 判断该版本是否已发布（中途失败重跑时跳过）
function isAlreadyPublishedError(error: unknown) {
  const text = [
    error instanceof Error ? error.message : String(error),
    (error as { stderr?: string; stdout?: string })?.stderr,
    (error as { stderr?: string; stdout?: string })?.stdout,
  ].filter(Boolean)
    .join('\n');
  return /EPUBLISHCONFLICT|cannot publish over|already been published|previously published/i.test(text);
}

// 逐包发布：OTP 过期则重新输入并重试当前包，避免一次 -r 用同一个 OTP 发到一半失败
async function publishPackagesOneByOne(
  packages: PublishPackagesInfo[],
  tag: string,
  branch: string,
) {
  let otp = '';

  for (const item of packages) {
    const name = item.packageJson.name!;
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!otp) {
        otp = (await question(
          `Input npm OTP for ${name} (attempt ${attempt}/${maxAttempts}, from authenticator now): `
        )).trim();
        assert(otp, 'OTP is required when account 2FA is enabled');
      }

      console.log(chalk.bold(`publishing ${name} ...`));
      try {
        await $`cd ${item.packagePath} ; pnpm publish --no-git-checks --tag ${tag} --publish-branch ${branch} --otp ${otp}`;
        console.log(chalk.green(`published ${name}`));
        break;
      } catch (error) {
        if (isAlreadyPublishedError(error)) {
          console.log(chalk.yellow(`${name} already published, skip`));
          break;
        }
        if (isOtpError(error) && attempt < maxAttempts) {
          console.log(chalk.yellow('OTP invalid or expired, enter a fresh code'));
          otp = '';
          continue;
        }
        throw error;
      }
    }
  }
}

// 立即执行的异步函数
(async() => {
  // 获取要发布的包信息
  const publishPackagesInfo = await getPublishPackagesInfo();

  // 获取第一个包的信息，用于检查
  const checkedPackage = publishPackagesInfo[0].packageJson;

  // 打印要发布的包名列表
  console.log(chalk.bold(`publish packages: \r\n\r\n${publishPackagesInfo.map((item) => item.packageJson.name)
    .join('\r\n')}\r\n\r\n`));

  // 获取当前 Git 分支名
  const { branch } = getGitRepoInfo();
  console.log(chalk.bold(`branch: ${branch}`));

  // 检查 Git 状态是否干净（没有未提交的更改）
  console.log(chalk.bold('check git status'));
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // 检查本地 Git 仓库是否与远程仓库同步
  console.log(chalk.bold('check git remote update'));
  await $`git fetch`;
  const gitStatus = (await $`git status --short --branch`).stdout.trim();
  assert(!gitStatus.includes('behind'), 'git status is behind remote');

  // 检查 NPM 仓库配置是否正确
  console.log(chalk.bold('check npm registry'));
  const registry = (await $`npm config get registry`).stdout.trim();
  assert(registry === publishRegistry, `npm registry is not ${publishRegistry}`);

  // 检查 NPM 包所有权（被注释掉了）
  // console.log(chalk.bold('check npm ownership'));
  // const whoami = (await $`npm whoami`).stdout.trim();
  // const owners = (await $`npm owner ls ${checkedPackage.name}`).stdout
  //   .trim()
  //   .split('\n')
  //   .map((line) => {
  //     return line.split(' ')[0];
  //   });
  //   console.log(whoami, owners, '---');
  // assert(owners.includes(whoami), `${checkedPackage.name} is not owned by ${whoami}`);

  // 构建包
  console.log(chalk.bold('build packages'));
  await $`cd ${cwd}; npm run ${buildCmd}`;

  // 测试包
  console.log(chalk.bold('test packages'));
  await $`cd ${cwd}; npm run ${testCmd}`;

  // 调整版本号
  console.log(chalk.bold('bump version'));

  // 提示用户输入发布版本号
  const version = (await question(
    `Input release version (current: ${checkedPackage.version}): `
  )).trim();

  // 根据版本号获取 NPM 标签
  const tag = getNpmTag(version);

  // 更新生成器包中的版本号
  console.log(chalk.bold('update generator packages'));
  await updateGeneratorPackages(version);

  // 为所有包更新版本号
  await Promise.all(publishPackagesInfo.map(async(item) => {
    (await $`cd ${item.packagePath} ; npm version ${version} --no-git-tag-version`);
  }));

  // 账号 2FA 开启后必须带 OTP；TOTP 约 30s 过期，不能用同一个 OTP 做 pnpm -r 连发
  // 改为逐包 publish：复用当前 OTP，遇 EOTP 再重新输入
  console.log(chalk.bold('publish packages (one by one, re-ask OTP on EOTP)'));
  await publishPackagesOneByOne(publishPackagesInfo, tag, branch);

  // 提交更改
  console.log(chalk.bold('commit'));
  await $`git commit --all --message "chore(*): release ${version}" --no-verify`;

  // 添加 Git 标签
  console.log(chalk.bold('git tag'));
  await $`git tag v${version}`;

  // 推送更改到远程仓库
  console.log(chalk.bold('git push'));
  await $`git push origin ${branch} --tags`;
})();
