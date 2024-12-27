import { FilterSelect } from '../filterSelect/filterSelect';
import { describe, test, expect } from 'vitest';

describe('filterSelect', () => {
  test('init', () => {
    const filterSelect = new FilterSelect({
      field: 'select',
      label: 'select',

      // @ts-ignore
      value: 11,
    });

    expect(filterSelect.value)
      .toBe('11');
    expect(filterSelect.placeholder)
      .toBe('请选择');

    filterSelect.value = '22';
    filterSelect.reset();
    expect(filterSelect.value)
      .toBe('11');
  });

  test('formatValue', () => {
    const filterSelect = new FilterSelect({
      field: 'select',
      label: 'select',
    });

    filterSelect.formatValue(null);
    expect(filterSelect.value)
      .toBeUndefined();

    filterSelect.formatValue('a');
    expect(filterSelect.value)
      .toBe('a');

    // @ts-ignore
    filterSelect.formatValue(1);
    expect(filterSelect.value)
      .toBe('1');

    filterSelect.mode = 'multiple';

    filterSelect.formatValue([
      // @ts-ignore
      1,
      '2',
    ]);
    expect(filterSelect.value)
      .toEqual([
        '1',
        '2',
      ]);

    filterSelect.formatValue('1,2');
    expect(filterSelect.value)
      .toEqual([
        '1',
        '2',
      ]);

    filterSelect.formatValue(null);
    expect(filterSelect.value)
      .toEqual([]);
  });

  test('toProgramme toParams translateParams', () => {
    const filterSelect = new FilterSelect({
      field: 'select',
      label: 'select',
      data: [
        {
          value: 'a',
          label: '1',
        },
        {
          value: 'b',
          label: '2',
        },
      ],
    });

    expect(filterSelect.toProgramme())
      .toBeNull();
    expect(filterSelect.toParams())
      .toEqual({});
    expect(filterSelect.translateParams())
      .toEqual([]);

    filterSelect.value = 'a';
    expect(filterSelect.toProgramme())
      .toBe('a');
    expect(filterSelect.toParams())
      .toEqual({ select: 'a' });
    expect(filterSelect.translateParams())
      .toEqual([
        'select',
        '1',
      ]);
  });

  test('toProgramme toParams translateParams multiple', () => {
    const filterSelect = new FilterSelect({
      field: 'select',
      label: 'select',
      mode: 'multiple',
      data: [
        {
          value: 'a',
          label: '1',
        },
        {
          value: 'b',
          label: '2',
        },
      ],
    });

    expect(filterSelect.toProgramme())
      .toBeNull();
    expect(filterSelect.toParams())
      .toEqual({});
    expect(filterSelect.translateParams())
      .toEqual([]);

    filterSelect.value = [
      'a',
      'b',
    ];
    expect(filterSelect.toProgramme())
      .toBe('a,b');
    expect(filterSelect.toParams())
      .toEqual({ select: 'a,b' });
    expect(filterSelect.translateParams())
      .toEqual([
        'select',
        '1,2',
      ]);
  });

  test('options', () => {
    const filterSelect = new FilterSelect({
      field: 'select',
      label: 'select',
      data: [
        {
          value: '1',
          label: 'a',
        },
        {
          value: '2',
          label: 'b',
        },
        {
          value: '3',
          label: 'c',
        },
        {
          value: '4',
          label: 'cc',
        },
      ],
    });

    expect(filterSelect.options.map((item) => item.value)
      .join(','))
      .toBe('1,2,3,4');

    filterSelect.searchValue = 'c';
    expect(filterSelect.options.map((item) => item.value)
      .join(','))
      .toBe('3,4');

    filterSelect.value = '1';
    expect(filterSelect.options.map((item) => item.value)
      .join(','))
      .toBe('1,3,4');

    filterSelect.value = '3';
    expect(filterSelect.options.map((item) => item.value)
      .join(','))
      .toBe('3,4');
  });
});
