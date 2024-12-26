import { FilterRadio } from '../filterRadio/filterRadio';
import { describe, test, expect } from 'vitest';

describe('filterRadio', () => {
  test('init', () => {
    const filterRadio = new FilterRadio({
      field: 'filterRadio',
      label: 'filterRadio',
      value: 'a',
    });

    expect(filterRadio.value).toBe('a');
    expect(filterRadio.inputValue).toBe('a');

    filterRadio.value = 'b';
    filterRadio.inputValue = 'b';
    filterRadio.reset();
    expect(filterRadio.value).toBe('a');
    expect(filterRadio.inputValue).toBe('a');
  });

  test('formatValue normal', () => {
    const filterRadio = new FilterRadio({
      field: 'filterRadio',
      label: 'filterRadio',
    });

    expect(filterRadio.value).toBeUndefined();
    expect(filterRadio.inputValue).toBe('');

    filterRadio.formatValue('a');
    expect(filterRadio.value).toBe('a');
    expect(filterRadio.inputValue).toBe('a');
  });

  test('formatValue input', () => {
    const filterRadio = new FilterRadio({
      field: 'filterRadio',
      label: 'filterRadio',
      data: [
        {
          value: 'a',
          label: 'b',
          showInput: true,
        },
      ],
    });

    filterRadio.formatValue('a');
    expect(filterRadio.value).toBe('a');
    expect(filterRadio.inputValue).toBe('');

    filterRadio.formatValue('b');
    expect(filterRadio.value).toBe('a');
    expect(filterRadio.inputValue).toBe('b');

    filterRadio.formatValue(null);
    expect(filterRadio.value).toBeUndefined();
    expect(filterRadio.inputValue).toBe('');
  });

  test('toProgramme toParams translateParams normal', () => {
    const filterRadio = new FilterRadio({
      field: 'filterRadio',
      label: 'filterRadio',
      data: [
        {
          value: 'a',
          label: '1',
        },
      ],
    });

    expect(filterRadio.toProgramme()).toBeNull();
    expect(filterRadio.toParams()).toEqual({});
    expect(filterRadio.translateParams()).toEqual([]);

    filterRadio.value = 'a';
    expect(filterRadio.toProgramme()).toBe('a');
    expect(filterRadio.toParams()).toEqual({ filterRadio: 'a' });
    expect(filterRadio.translateParams()).toEqual([
      'filterRadio',
      '1',
    ]);
  });

  test('toProgramme toParams translateParams input', () => {
    const filterRadio = new FilterRadio({
      field: 'filterRadio',
      label: 'filterRadio',
      data: [
        {
          value: 'a',
          label: '1',
          showInput: true,
        },
        {
          value: 'b',
          label: '2',
        },
      ],
    });

    expect(filterRadio.toProgramme()).toBeNull();
    expect(filterRadio.toParams()).toEqual({});
    expect(filterRadio.translateParams()).toEqual([]);

    filterRadio.inputValue = 'a';
    expect(filterRadio.toProgramme()).toBe('a');
    expect(filterRadio.toParams()).toEqual({ filterRadio: 'a' });
    expect(filterRadio.translateParams()).toEqual([
      'filterRadio',
      'a',
    ]);

    filterRadio.inputValue = 'b';
    filterRadio.value = 'a';
    expect(filterRadio.toProgramme()).toBe('b');
    expect(filterRadio.toParams()).toEqual({ filterRadio: 'b' });
    expect(filterRadio.translateParams()).toEqual([
      'filterRadio',
      'b',
    ]);

    filterRadio.inputValue = 'a';
    filterRadio.value = 'b';
    expect(filterRadio.toProgramme()).toBe('b');
    expect(filterRadio.toParams()).toEqual({ filterRadio: 'b' });
    expect(filterRadio.translateParams()).toEqual([
      'filterRadio',
      '2',
    ]);

    filterRadio.inputValue = '';
    filterRadio.value = 'a';
    expect(filterRadio.toProgramme()).toBe('a');
    expect(filterRadio.toParams()).toEqual({ filterRadio: 'a' });
    expect(filterRadio.translateParams()).toEqual([
      'filterRadio',
      '1',
    ]);

    filterRadio.inputValue = '';
    filterRadio.value = 'b';
    expect(filterRadio.toProgramme()).toBe('b');
    expect(filterRadio.toParams()).toEqual({ filterRadio: 'b' });
    expect(filterRadio.translateParams()).toEqual([
      'filterRadio',
      '2',
    ]);
  });
});
