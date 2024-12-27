import type { FormatterProps } from '../types';

export function ValueFormatter<R, SR>(props: FormatterProps<R, SR>) {
  try {
    const value = props.row[props.column.key as keyof R];
    if (typeof value === 'string' && value) {
      // 表格使用line-height来垂直居中对齐，换行符后的文本会展示不全，将换行符转为空格避免这个问题
      const formattedValue = value.replace(/\n/g, ' ');
      return (
        <span title={value}>
          {formattedValue}
        </span>
      );
    } else {
      return <>{value}</>;
    }
  } catch {
    return null;
  }
}
