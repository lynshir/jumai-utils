import { FilterInputNumberGroup, formatNumberString } from '../filterInputNumberGroup/filterInputNumberGroup';
import { describe, test, expect } from 'vitest';

describe('filterInputNumberGroup', () => {
  test('init', () => {
    const filterInputNumberGroup = new FilterInputNumberGroup({
      field: 'inputNumberGroup',
      label: 'inputNumberGroup',
    });

    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      null,
      null,
    ]);

    filterInputNumberGroup.value = [
      1,
      2,
    ];
    filterInputNumberGroup.reset();
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      null,
      null,
    ]);
  });

  test('formatNumberString', () => {
    expect(formatNumberString([
      null,
      null,
    ])).toBe('');

    expect(formatNumberString([
      1,
      2,
    ])).toBe('1,2');

    expect(formatNumberString([
      1,
      null,
    ])).toBe('1,');

    expect(formatNumberString([
      null,
      2,
    ])).toBe(',2');
  });

  test('formatValue normal', () => {
    const filterInputNumberGroup = new FilterInputNumberGroup({
      field: 'inputNumberGroup',
      label: 'inputNumberGroup',
    });

    filterInputNumberGroup.formatValue(null);
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      null,
      null,
    ]);

    filterInputNumberGroup.formatValue([
      1,
      2,
    ]);
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      1,
      2,
    ]);

    filterInputNumberGroup.formatValue('');
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      null,
      null,
    ]);

    filterInputNumberGroup.formatValue('1');
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      1,
      null,
    ]);

    filterInputNumberGroup.formatValue(',2');
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      null,
      2,
    ]);

    filterInputNumberGroup.formatValue('1,2');
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      1,
      2,
    ]);
  });

  test('formatValue multiple', () => {
    const filterInputNumberGroup = new FilterInputNumberGroup({
      field: 'inputNumberGroup',
      label: 'inputNumberGroup',
    });

    filterInputNumberGroup.data = [
      {
        value: 'a',
        label: '1',
      },
      {
        value: 'b',
        label: '2',
      },
    ];

    filterInputNumberGroup.formatValue('');
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      null,
      null,
    ]);

    filterInputNumberGroup.formatValue('a');
    expect(filterInputNumberGroup.selectValue).toBe('a');
    expect(filterInputNumberGroup.value).toEqual([
      null,
      null,
    ]);

    filterInputNumberGroup.formatValue('a,1');
    expect(filterInputNumberGroup.selectValue).toBe('a');
    expect(filterInputNumberGroup.value).toEqual([
      1,
      null,
    ]);

    filterInputNumberGroup.formatValue('a,1,2');
    expect(filterInputNumberGroup.selectValue).toBe('a');
    expect(filterInputNumberGroup.value).toEqual([
      1,
      2,
    ]);

    filterInputNumberGroup.formatValue(',1,2');
    expect(filterInputNumberGroup.selectValue).toBeUndefined();
    expect(filterInputNumberGroup.value).toEqual([
      1,
      2,
    ]);
  });

  test('toProgramme toParams translateParams normal', () => {
    const filterInputNumberGroup = new FilterInputNumberGroup({
      field: 'inputNumberGroup',
      label: 'inputNumberGroup',
    });

    expect(filterInputNumberGroup.toProgramme()).toBeNull();
    expect(filterInputNumberGroup.toParams()).toEqual({});
    expect(filterInputNumberGroup.translateParams()).toEqual([]);

    filterInputNumberGroup.value = [
      1,
      2,
    ];
    expect(filterInputNumberGroup.toProgramme()).toBe('1,2');
    expect(filterInputNumberGroup.toParams()).toEqual({ inputNumberGroup: '1,2' });
    expect(filterInputNumberGroup.translateParams()).toEqual([
      'inputNumberGroup',
      '1至2',
    ]);
  });

  test('toParams  custom', () => {
    const filterInputNumberGroup = new FilterInputNumberGroup({
      field: 'inputNumberGroup',
      label: 'inputNumberGroup',
      minParamsField: 'min',
      maxParamsField: 'max',
    });

    filterInputNumberGroup.value = [
      1,
      2,
    ];
    expect(filterInputNumberGroup.toParams()).toEqual({
      min: '1',
      max: '2',
    });

    filterInputNumberGroup.value = [
      1,
      null,
    ];
    expect(filterInputNumberGroup.toParams()).toEqual({
      min: '1',
      max: null,
    });

    filterInputNumberGroup.value = [
      null,
      2,
    ];
    expect(filterInputNumberGroup.toParams()).toEqual({
      min: null,
      max: '2',
    });
  });

  test('toProgramme toParams translateParams multiple', () => {
    const filterInputNumberGroup = new FilterInputNumberGroup({
      field: 'inputNumberGroup',
      label: 'inputNumberGroup',
      data: [
        {
          value: 'a',
          label: 'aa',
        },
        {
          value: 'b',
          label: 'bb',
        },
      ],
    });

    expect(filterInputNumberGroup.toProgramme()).toBeNull();
    expect(filterInputNumberGroup.toParams()).toEqual({});
    expect(filterInputNumberGroup.translateParams()).toEqual([]);

    filterInputNumberGroup.selectValue = 'a';
    expect(filterInputNumberGroup.toProgramme()).toBe('a');
    expect(filterInputNumberGroup.toParams()).toEqual({});
    expect(filterInputNumberGroup.translateParams()).toEqual([]);

    filterInputNumberGroup.value = [
      1,
      2,
    ];
    expect(filterInputNumberGroup.toProgramme()).toBe('a,1,2');
    expect(filterInputNumberGroup.toParams()).toEqual({ a: '1,2' });
    expect(filterInputNumberGroup.translateParams()).toEqual([
      'aa',
      '1至2',
    ]);
  });
});
