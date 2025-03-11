import { ENV_LIST, BOSS_LIST, ERP_LIST, CLOUD_LIST, GALLERY_LIST, SHJ_LIST } from './constant';
import fs from 'fs';

export function hasAnnotation(code: string) {
  return code.startsWith('//') || (code.startsWith('/*') && code.startsWith('*/'));
}

export function findTarget(targets: string[], line) {
  return targets.find((item) => line.includes(item)) || '';
}

export function getSelectList(projectName) {
  switch (projectName) {
    case 'jumai-boss':
      return BOSS_LIST.concat(...ENV_LIST);
    case 'jumai-cloud-wms':
      return CLOUD_LIST.concat(...ENV_LIST);
    case 'jumai-ts-gallery':
      return ERP_LIST.concat(...GALLERY_LIST);
    case 'jumai-ts-vogue':
      return ERP_LIST.concat(...SHJ_LIST, ...ENV_LIST);
    default:
      return ERP_LIST.concat(...ENV_LIST);
  }
}

export function insertLineInFile(filePath: string, lineNumber: number, text: string, fromBottom?: boolean) {
  const data = fs.readFileSync(filePath, 'utf8');

  const lines = data.split('\n');
  if (lineNumber < 1 || lineNumber > lines.length) {
    console.error('行号超出文件范围');
    return;
  }

  // 从底部开始第几行
  if (fromBottom) {
    lineNumber = lines.length - lineNumber;
  }

  lines.splice(lineNumber - 1, 0, text);
  const newData = lines.join('\n');
  fs.writeFileSync(filePath, newData, 'utf8');
}

