# jumai-utils Cursor 规则（全局）

给**所有**依赖 `jumai-utils` 的业务项目用，不要把这份规则再复制进某个业务仓库。

## 个人安装（对本机所有项目生效）

```bash
# 仓库路径按本机实际位置修改
REPO=/Users/fxy/biying/jumai-utils

mkdir -p ~/.cursor/skills ~/.cursor/rules
ln -sfn "$REPO/.cursor/skills/jumai-utils" ~/.cursor/skills/jumai-utils
ln -sfn "$REPO/.cursor/rules/jumai-utils.mdc" ~/.cursor/rules/jumai-utils.mdc
ln -sfn "$REPO/.cursor/rules/jumai-utils-list-pages.mdc" ~/.cursor/rules/jumai-utils-list-pages.mdc
ln -sfn "$REPO/.cursor/rules/jumai-utils-components.mdc" ~/.cursor/rules/jumai-utils-components.mdc
```

装好后，在任意业务项目里说「新建左右结构列表页」「全屏弹窗」等，Agent 会走这套约定。

## 团队

每人在自己机器上执行一次上面的 symlink。规则源码只维护在本仓库 `.cursor/`。
