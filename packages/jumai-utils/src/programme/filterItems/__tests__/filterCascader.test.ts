import { FilterCascader } from '../filterCascader/filterCascader';
import { describe, test, expect } from 'vitest';

describe('filterCascader', () => {
  test('init', () => {
    const filterCascader = new FilterCascader({
      field: 'cascader',
      label: 'cascader',
    });

    // @ts-ignore
    filterCascader.value = 11;
    expect(filterCascader.value).toEqual([]);

    filterCascader.value = ['11'];
    filterCascader.reset();
    expect(filterCascader.value).toEqual([]);
  });

  test('formatValue', () => {
    const filterCascader = new FilterCascader({
      field: 'cascader',
      label: 'cascader',
    });

    filterCascader.formatValue('aa');
    expect(filterCascader.value).toEqual(['aa']);

    filterCascader.formatValue('aa,bb');
    expect(filterCascader.value).toEqual([
      'aa',
      'bb',
    ]);
  });

  test('toProgramme toParams translateParams', () => {
    const filterCascader = new FilterCascader({
      field: 'cascader',
      label: 'cascader',
      data: [
        {
          value: 'aa',
          label: '11',
          children: [
            {
              value: 'bb',
              label: '22',
            },
          ],
        },
      ],
    });

    expect(filterCascader.toProgramme()).toBeNull();
    expect(filterCascader.toParams()).toEqual({});
    expect(filterCascader.translateParams()).toEqual([]);

    filterCascader.value = ['aa'];
    expect(filterCascader.toProgramme()).toBe('aa');
    expect(filterCascader.toParams()).toEqual({ cascader: 'aa' });
    expect(filterCascader.translateParams()).toEqual([
      'cascader',
      '11',
    ]);

    filterCascader.value = [
      'aa',
      'bb',
    ];
    expect(filterCascader.toProgramme()).toBe('aa,bb');
    expect(filterCascader.toParams()).toEqual({ cascader: 'aa,bb' });
    expect(filterCascader.translateParams()).toEqual([
      'cascader',
      '11,22',
    ]);
  });
});
