import fs from 'fs';
import path from 'path';

export const PAGE_LIST = [
  {
    name: 'normalPage（普通页面）',
    value: 'normalPage',
  },
  {
    name: 'searchListPage（上下结构查询页面）',
    value: 'searchListPage',
  },
  {
    name: 'programme（左右结构查询页面：不带子表）',
    value: 'programmePage',
  },
  {
    name: 'programme（左右结构查询页面：带子表）',
    value: 'programmePageWithSub',
  },
];

export const BOSS_LIST = [
  {
    name: 'test(boss):https://cdtestboss.ejingling.cn/',
    value: 'https://cdtestboss.ejingling.cn/',
  },
  {
    name: 'uat(boss):https://cduatboss.ejingling.cn/',
    value: 'https://cduatboss.ejingling.cn/',
  },
];

export const ERP_LIST = [
  {
    name: 'test(erp):https://cdtesterp.ejingling.cn',
    value: 'https://cdtesterp.ejingling.cn',
  },
  {
    name: 'uat(erp):https://cduaterp.ejingling.cn',
    value: 'https://cduaterp.ejingling.cn',
  },
];

export const CLOUD_LIST = [
  {
    name: 'test(cloud):https://cdtestcloudwms.ejingling.cn',
    value: 'https://cdtestcloudwms.ejingling.cn',
  },
  {
    name: 'uat(cloud):https://cduatcloudwms.ejingling.cn',
    value: 'https://cduatcloudwms.ejingling.cn',
  },
];

export const ENV_LIST = [
  {
    name: 'release(hz11):https://dap111.ejingling.cn',
    value: 'https://dap111.ejingling.cn',
  },
  {
    name: 'release(hz13):https://dap113.ejingling.cn',
    value: 'https://dap113.ejingling.cn',
  },
];

export const GALLERY_LIST = [
  {
    name: 'release(zt):https://show.ejingling.cn',
    value: 'https://show.ejingling.cn',
  },
];

export const SHJ_LIST = [
  {
    name: 'test(shj):https://testshj.ejingling.cn',
    value: 'https://testshj.ejingling.cn',
  },
  {
    name: 'uat(shj):https://uatshj.ejingling.cn',
    value: 'https://uatshj.ejingling.cn',
  },
  {
    name: 'release(shj):https://shj.ejingling.cn',
    value: 'https://shj.ejingling.cn',
  },
];
export const CUSTOME = [
  {
    name: '自定义目标环境',
    value: 'custom',
  },
];
export const userConfigFile = 'bundlerConfig.ts';

export const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')
  .toString());

export const cwd = fs.realpathSync(process.cwd());

export const projectName = path.basename(process.cwd());

export const tempUserConfig = './tempConfigFile.ts';
