import { FilterPatternSearch } from '../filterPatternSearch/filterPatternSearch';
import { describe, test, expect } from 'vitest';

describe('filterPatternSearch', () => {
  test('init', () => {
    const filterPatternSearch = new FilterPatternSearch({
      field: 'filterPatternSearch',
      label: 'filterPatternSearch',
      selectValue: 'a',
      inputValue: 'a',
    });

    expect(filterPatternSearch.selectValue).toBe('a');
    expect(filterPatternSearch.inputValue).toBe('a');

    filterPatternSearch.selectValue = 'b';
    filterPatternSearch.inputValue = 'b';
    filterPatternSearch.reset();
    expect(filterPatternSearch.selectValue).toBe('a');
    expect(filterPatternSearch.inputValue).toBe('a');
  });

  test('formatValue normal', () => {
    const filterPatternSearch = new FilterPatternSearch({
      field: 'filterPatternSearch',
      label: 'filterPatternSearch',
    });

    expect(filterPatternSearch.selectValue).toBeUndefined();
    expect(filterPatternSearch.inputValue).toBe('');

    filterPatternSearch.formatValue(null);
    expect(filterPatternSearch.selectValue).toBeUndefined();
    expect(filterPatternSearch.inputValue).toBe('');

    filterPatternSearch.formatValue('');
    expect(filterPatternSearch.selectValue).toBe('');
    expect(filterPatternSearch.inputValue).toBe('');
  });

  test('formatValue selectValue and inputValue', () => {
    const filterPatternSearch = new FilterPatternSearch({
      field: 'filterPatternSearch',
      label: 'filterPatternSearch',
      selectValue: '',
      inputValue: 'a',
    });

    expect(filterPatternSearch.selectValue).toBe('');
    expect(filterPatternSearch.inputValue).toBe('a');

    filterPatternSearch.formatValue('a');
    expect(filterPatternSearch.selectValue).toBe('a');
    expect(filterPatternSearch.inputValue).toBe('');

    filterPatternSearch.formatValue('a,b');
    expect(filterPatternSearch.selectValue).toBe('a');
    expect(filterPatternSearch.inputValue).toBe('b');

    filterPatternSearch.formatValue('a,b,b');
    expect(filterPatternSearch.selectValue).toBe('a');
    expect(filterPatternSearch.inputValue).toBe('b,b');
  });

  test('toProgramme toParams translateParams normal', () => {
    const filterPatternSearch = new FilterPatternSearch({
      field: 'filterPatternSearch',
      label: 'filterPatternSearch',
    });

    expect(filterPatternSearch.toProgramme()).toBeNull();
    expect(filterPatternSearch.toParams()).toEqual({});
    expect(filterPatternSearch.translateParams()).toEqual([]);

    filterPatternSearch.formatValue(null);
    expect(filterPatternSearch.toProgramme()).toBeNull();
    expect(filterPatternSearch.toParams()).toEqual({});
    expect(filterPatternSearch.translateParams()).toEqual([]);

    filterPatternSearch.formatValue('');
    expect(filterPatternSearch.toProgramme()).toBe(',');
    expect(filterPatternSearch.toParams()).toEqual({ filterPatternSearch: ',' });
    expect(filterPatternSearch.translateParams()).toEqual([]);
  });

  test('toProgramme toParams translateParams', () => {
    const data = [
      {
        value: '',
        label: '全部',
      },
      {
        value: 'a',
        label: '包含',
      },
    ];
    const filterPatternSearch = new FilterPatternSearch({
      field: 'filterPatternSearch',
      label: 'filterPatternSearch',
      selectValue: '',
      inputValue: ' b ',
      data,
    });

    expect(filterPatternSearch.toProgramme()).toBe(',b');
    expect(filterPatternSearch.toParams()).toEqual({ filterPatternSearch: ',b' });
    expect(filterPatternSearch.translateParams()).toEqual([
      'filterPatternSearch',
      `${data[0].label}b`,
    ]);

    filterPatternSearch.formatValue('a,b');
    expect(filterPatternSearch.toProgramme()).toBe('a,b');
    expect(filterPatternSearch.toParams()).toEqual({ filterPatternSearch: 'a,b' });
    expect(filterPatternSearch.translateParams()).toEqual([
      'filterPatternSearch',
      `${data[1].label}b`,
    ]);

    filterPatternSearch.selectParamsField = 'select';
    filterPatternSearch.inputParamsField = 'input';
    expect(filterPatternSearch.toProgramme()).toBe('a,b');
    expect(filterPatternSearch.toParams()).toEqual({
      select: 'a',
      input: 'b',
    });
    expect(filterPatternSearch.translateParams()).toEqual([
      'filterPatternSearch',
      `${data[1].label}b`,
    ]);

    filterPatternSearch.selectParamsField = 'select';
    filterPatternSearch.inputParamsField = 'select';
    expect(filterPatternSearch.toProgramme()).toBe('a,b');
    expect(filterPatternSearch.toParams()).toEqual({ select: 'b' });
    expect(filterPatternSearch.translateParams()).toEqual([
      'filterPatternSearch',
      `${data[1].label}b`,
    ]);
  });
});
