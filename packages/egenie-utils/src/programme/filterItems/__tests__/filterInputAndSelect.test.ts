import { FilterInputAndSelect } from '../filterInputAndSelect/filterInputAndSelect';
import { describe, test, expect } from 'vitest';

describe('filterInputAndSelect', () => {
  test('init', () => {
    const filterInputAndSelect = new FilterInputAndSelect({
      field: 'inputAndSelect',
      label: 'inputAndSelect',
      inputValue: '1',
      selectValue: '2',
    });

    expect(filterInputAndSelect.inputValue).toBe('1');
    expect(filterInputAndSelect.selectValue).toBe('2');

    filterInputAndSelect.inputValue = 'a';
    filterInputAndSelect.selectValue = 'b';
    filterInputAndSelect.reset();
    expect(filterInputAndSelect.inputValue).toBe('1');
    expect(filterInputAndSelect.selectValue).toBe('2');
  });

  test('formatValue', () => {
    const filterInputAndSelect = new FilterInputAndSelect({
      field: 'inputAndSelect',
      label: 'inputAndSelect',
    });

    filterInputAndSelect.formatValue(null);
    expect(filterInputAndSelect.inputValue).toBe('');
    expect(filterInputAndSelect.selectValue).toBeUndefined();

    filterInputAndSelect.formatValue('a');
    expect(filterInputAndSelect.inputValue).toBe('');
    expect(filterInputAndSelect.selectValue).toBe('a');

    filterInputAndSelect.formatValue(',a');
    expect(filterInputAndSelect.inputValue).toBe('a');
    expect(filterInputAndSelect.selectValue).toBeUndefined();

    filterInputAndSelect.formatValue('a,b');
    expect(filterInputAndSelect.inputValue).toBe('b');
    expect(filterInputAndSelect.selectValue).toBe('a');
  });

  test('toProgramme toParams translateParams', () => {
    const filterInputAndSelect = new FilterInputAndSelect({
      field: 'inputAndSelect',
      label: 'inputAndSelect',
      data: [
        {
          value: 'a',
          label: '1',
        },
      ],
    });

    expect(filterInputAndSelect.toProgramme()).toBeNull();
    expect(filterInputAndSelect.toParams()).toEqual({});
    expect(filterInputAndSelect.translateParams()).toEqual([]);

    filterInputAndSelect.selectValue = 'a';
    expect(filterInputAndSelect.toProgramme()).toBe('a');
    expect(filterInputAndSelect.toParams()).toEqual({});
    expect(filterInputAndSelect.translateParams()).toEqual([]);

    filterInputAndSelect.selectValue = undefined;
    filterInputAndSelect.inputValue = 'b';
    expect(filterInputAndSelect.toProgramme()).toBeNull();
    expect(filterInputAndSelect.toParams()).toEqual({});
    expect(filterInputAndSelect.translateParams()).toEqual([]);

    filterInputAndSelect.selectValue = 'a';
    filterInputAndSelect.inputValue = 'b';
    expect(filterInputAndSelect.toProgramme()).toBe('a,b');
    expect(filterInputAndSelect.toParams()).toEqual({ a: 'b' });
    expect(filterInputAndSelect.translateParams()).toEqual([
      '1',
      'b',
    ]);
  });
});
