import { FilterBase } from '../filterBase';
import { trimWhiteSpace } from '../utils';
import { describe, test, expect } from 'vitest';

class CommonBase extends FilterBase {
  constructor() {
    super();
  }

  public formatValue(value?: string) {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public reset() {
  }

  public translateParams(): string[] {
    return [];
  }

  public toProgramme(): string | null {
    return undefined;
  }

  public toParams(): {[p: string]: string; } {
    return {};
  }
}

describe('filterBase', () => {
  test('init', () => {
    const commonBase = new CommonBase();
    expect(commonBase.showItem)
      .toBeTruthy();
    expect(commonBase.labelWidth)
      .toBe(92);
    expect(commonBase.field)
      .toBe('');
    expect(commonBase.label)
      .toBe('');
    expect(commonBase.onPressEnter)
      .toBeDefined();
    expect(commonBase.style)
      .toEqual({});
    expect(commonBase.className)
      .toBe('');
    expect(commonBase.data)
      .toEqual([]);
    expect(commonBase.handleData)
      .toBeDefined();

    commonBase.data = [
      {
        // @ts-ignore
        value: 1,
        label: 'a',
      },
    ];

    expect(commonBase.data)
      .toEqual([
        {
          value: '1',
          label: 'a',
        },
      ]);
  });

  test('utils', () => {
    expect(trimWhiteSpace('aa', false)).toBe('aa');
    expect(trimWhiteSpace('  aa', false)).toBe('  aa');
    expect(trimWhiteSpace('aa  ', false)).toBe('aa  ');
    expect(trimWhiteSpace('  aa  ', false)).toBe('  aa  ');
    expect(trimWhiteSpace('aa', true)).toBe('aa');
    expect(trimWhiteSpace(' aa', true)).toBe('aa');
    expect(trimWhiteSpace('aa  ', true)).toBe('aa');
    expect(trimWhiteSpace('  aa  ', true)).toBe('aa');
  });
});
