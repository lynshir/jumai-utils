import { FilterCheckbox } from '../filterCheckbox/filterCheckbox';
import { describe, test, expect } from 'vitest';

describe('filterCheckbox', () => {
  test('init', () => {
    const filterCheckbox = new FilterCheckbox({
      field: 'checkbox',
      label: 'checkbox',

      // @ts-ignore
      value: 11,
    });

    expect(filterCheckbox.value).toEqual([]);

    filterCheckbox.value = ['11'];
    filterCheckbox.reset();
    expect(filterCheckbox.value).toEqual([]);
  });

  test('formatValue', () => {
    const filterCheckbox = new FilterCheckbox({
      field: 'checkbox',
      label: 'checkbox',
    });

    filterCheckbox.formatValue([' aa ']);
    expect(filterCheckbox.value).toEqual([' aa ']);

    filterCheckbox.formatValue('aa');
    expect(filterCheckbox.value).toEqual(['aa']);

    filterCheckbox.formatValue('aa,bb');
    expect(filterCheckbox.value).toEqual([
      'aa',
      'bb',
    ]);
  });

  test('toProgramme toParams translateParams', () => {
    const filterCheckbox = new FilterCheckbox({
      field: 'checkbox',
      label: 'checkbox',
      data: [
        {
          value: 'aa',
          label: '11',
        },
        {
          value: 'bb',
          label: '22',
        },
      ],
    });

    expect(filterCheckbox.toProgramme()).toBeNull();
    expect(filterCheckbox.toParams()).toEqual({});
    expect(filterCheckbox.translateParams()).toEqual([]);

    filterCheckbox.value = ['aa'];
    expect(filterCheckbox.toProgramme()).toBe('aa');
    expect(filterCheckbox.toParams()).toEqual({ checkbox: 'aa' });
    expect(filterCheckbox.translateParams()).toEqual([
      'checkbox',
      '11',
    ]);

    filterCheckbox.value = [
      'aa',
      'bb',
    ];
    expect(filterCheckbox.toProgramme()).toBe('aa,bb');
    expect(filterCheckbox.toParams()).toEqual({ checkbox: 'aa,bb' });
    expect(filterCheckbox.translateParams()).toEqual([
      'checkbox',
      '11,22',
    ]);
  });
});
