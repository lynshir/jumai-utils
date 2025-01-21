import { FilterInputOrSelect } from '../filterInputOrSelect/filterInputOrSelect';
import { describe, test, expect } from 'vitest';

describe('filterInputAndSelect', () => {
  test('init', () => {
    const filterInputOrSelect = new FilterInputOrSelect({
      field: 'inputOrSelect',
      label: 'inputOrSelect',
      selectValue: '1',
      value: '2',
    });

    expect(filterInputOrSelect.selectValue).toBeUndefined();
    expect(filterInputOrSelect.value).toBe('2');

    filterInputOrSelect.selectValue = 'a';
    filterInputOrSelect.value = 'b';
    filterInputOrSelect.reset();
    expect(filterInputOrSelect.selectValue).toBeUndefined();
    expect(filterInputOrSelect.value).toBe('2');
  });

  test('formatValue', () => {
    const filterInputOrSelect = new FilterInputOrSelect({
      field: 'inputOrSelect',
      label: 'inputOrSelect',
    });

    filterInputOrSelect.formatValue('a');
    expect(filterInputOrSelect.selectValue).toBeUndefined();
    expect(filterInputOrSelect.value).toBe('a');

    filterInputOrSelect.data = [
      {
        value: 'a',
        label: '1',
      },
    ];
    filterInputOrSelect.formatValue('a');
    expect(filterInputOrSelect.selectValue).toBe('a');
    expect(filterInputOrSelect.value).toBe('');
  });

  test('toProgramme toParams translateParams', () => {
    const filterInputOrSelect = new FilterInputOrSelect({
      field: 'inputOrSelect',
      label: 'inputOrSelect',
      data: [
        {
          value: 'b',
          label: '2',
        },
      ],
    });

    expect(filterInputOrSelect.toProgramme()).toBeNull();
    expect(filterInputOrSelect.toParams()).toEqual({});
    expect(filterInputOrSelect.translateParams()).toEqual([]);

    filterInputOrSelect.value = 'a';
    expect(filterInputOrSelect.toProgramme()).toBe('a');
    expect(filterInputOrSelect.toParams()).toEqual({ inputOrSelect: 'a' });
    expect(filterInputOrSelect.translateParams()).toEqual([
      'inputOrSelect',
      'a',
    ]);

    filterInputOrSelect.value = '';
    filterInputOrSelect.selectValue = 'b';
    expect(filterInputOrSelect.toProgramme()).toBe('b');
    expect(filterInputOrSelect.toParams()).toEqual({ inputOrSelect: 'b' });
    expect(filterInputOrSelect.translateParams()).toEqual([
      'inputOrSelect',
      '2',
    ]);

    filterInputOrSelect.value = 'a';
    filterInputOrSelect.selectValue = 'b';
    expect(filterInputOrSelect.toProgramme()).toBe('a');
    expect(filterInputOrSelect.toParams()).toEqual({ inputOrSelect: 'a' });
    expect(filterInputOrSelect.translateParams()).toEqual([
      'inputOrSelect',
      'a',
    ]);
  });
});
