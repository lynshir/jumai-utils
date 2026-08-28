#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const templatesDir = path.join(__dirname, '../templates/husky');
const huskyDir = path.join(projectRoot, '.husky');

const hookFiles = ['pre-commit', 'commit-msg'];

function copyHook(name) {
  const source = path.join(templatesDir, name);
  const target = path.join(huskyDir, name);
  fs.copyFileSync(source, target);
  fs.chmodSync(target, 0o755);
  console.log(`created .husky/${name}`);
}

if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
  console.error('jumai-code-style-setup-husky must run in a project root.');
  process.exit(1);
}

try {
  execSync('pnpm exec husky init', { cwd: projectRoot, stdio: 'inherit' });
} catch (error) {
  console.error('failed to run "pnpm exec husky init". install husky first: pnpm add -D husky');
  process.exit(1);
}

hookFiles.forEach(copyHook);

console.log('');
console.log('Git hooks 为pnpm已完成初始化.');
console.log('确保 package.json 中包含:');
console.log('  "scripts": { "prepare": "husky" }');
console.log('并且 peer dependencies 从 jumai-code-style 中安装为 devDependencies.');
