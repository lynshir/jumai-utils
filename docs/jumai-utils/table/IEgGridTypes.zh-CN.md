---
title: 配置类型
order: 6
toc: content
---

# `EgGridModel配置类型`

### `StrOrNum`

- 类型: number | string

### `IObj`

- 类型:{[key: string]: any;}

### `SubRowAction`

- 类型: { type: 'toggleSubRow' | 'deleteSubRow'; id: [StrOrNum](#StrOrNum); primaryKeyField: [StrOrNum](#StrOrNum); isBatch?: boolean; }

### `Columns`

```ts
interface {
  /** 列的名称。默认情况下，它将显示在标题单元格中 */
  name: string | ReactElement;

  /** 区分每一列的唯一键 */
  key: string;

  /** 列宽。 如果未指定，则根据网格宽度和其他列的指定宽度自动确定 */
  width?: number | string;

  /** 最小列宽 */
  minWidth?: number;

  /** 最大列宽 */
  maxWidth?: number;

  /** 单元格类名 */
  cellClass?: string | ((row: TRow) => string | undefined);

  /** 表头单元格类名 */
  headerCellClass?: string;

  /** 汇总行单元格类名 */
  summaryCellClass?: string | ((row: TSummaryRow) => string);

  /** 格式化单元格 */
  formatter?: React.ComponentType<FormatterProps<TRow, TSummaryRow>>;

  /** 格式化汇总单元格 */
  summaryFormatter?: React.ComponentType<SummaryFormatterProps<TSummaryRow, TRow>>;

  /** 格式化分组单元格 */
  groupFormatter?: React.ComponentType<GroupFormatterProps<TRow, TSummaryRow>>;

  /** 启用单元格编辑。 如果设置且未指定编辑器属性，则文本输入将用作单元格编辑器 */
  editable?: boolean | ((row: TRow) => boolean);
  colSpan?: (args: ColSpanArgs<TRow, TSummaryRow>) => number | undefined;

  /** 是否冻结列 */
  frozen?: boolean;

  /** 是否可调整大小 */
  resizable?: boolean;

  /** 是否可列排序 */
  sortable?: boolean;

  /** 第一次对列进行排序时，将列排序顺序设置为降序而不是升序 */
  sortDescendingFirst?: boolean;

  /** 编辑列单元格时要呈现的编辑器。 如果设置，则该列将自动设置为可编辑 */
  editor?: React.ComponentType<EditorProps<TRow, TSummaryRow>>;
  editorOptions?: {
    /** 默认false, 暂未用到 */
    createPortal?: boolean;

    /** 点击编辑，默认false */
    editOnClick?: boolean;

    /** 阻止默认取消编辑, 暂未用到  */
    onCellKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;

    /** 在编辑器打开时控制默认的单元格导航行为， 暂未用到  */
    onNavigation?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
  };

  /** 每个标题单元格的标题渲染器 */
  headerRenderer?: React.ComponentType<HeaderRendererProps<TRow, TSummaryRow>>;

  /** 用于过滤列数据的组件，暂未用到，需重新封装 */
  filterRenderer?: React.ComponentType<FilterRendererProps<TRow, any, TSummaryRow>>;

  /** 自定义排序字段 */
  sidx?: string;

  /** 是否隐藏列，默认false */
  ejlHidden?: boolean;
}
```

### `SortDirection`

- 类型: 'ASC' | 'DESC'

### `CollectData`

```ts
interface {
  /** 名称*/
  name: string;
  /** 显示值*/
  value: string | number | ReactNode;
  /** 颜色*/
  color?: string;
}
```

### `BtnExtraLeft`

```ts
interface {
  /** 是否显示警告图标*/
  isWarnIcon: string;
  /** title*/
  text: ReactNode;
  /** title链接地址*/
  linkBtnText: string;
  /** 点击链接时的回调*/
  handleLinkBtnClick?: (event: ReactEventHandler) => void;
}
```

### `TSummaryRows`

- 类型: string[] | [IObj](#IObj)[] | ((rows?: [IObj](./ieg-grid-types#IObj)[]) => [IObj](./ieg-grid-types#IObj)[])
