import { FilterTreeSelect } from '../filterTreeSelect/filterTreeSelect';
import { describe, test, expect } from 'vitest';

describe('filterTreeSelect', () => {
  test('init', () => {
    const filterTreeSelect = new FilterTreeSelect({
      field: 'treeSelect',
      label: 'treeSelect',
      value: ['11'],
    });

    expect(filterTreeSelect.value).toEqual(['11']);

    filterTreeSelect.value = [];
    filterTreeSelect.reset();
    expect(filterTreeSelect.value).toEqual(['11']);
  });

  test('toProgramme toParams translateParams', () => {
    const filterTreeSelect = new FilterTreeSelect({
      field: 'treeSelect',
      label: 'treeSelect',
      treeData: [
        {
          value: 'a',
          label: '1',
          title: '1',
          children: [
            {
              value: 'b',
              label: '2',
              title: '2',
              children: [
                {
                  value: 'c',
                  label: '3',
                  title: '3',
                },
              ],
            },
          ],
        },
        {
          value: 'd',
          label: '4',
          title: '4',
          children: [
            {
              value: 'e',
              label: '5',
              title: '5',
            },
          ],
        },
        {
          value: 'f',
          label: '6',
          title: null,
        },
      ],
    });

    expect(filterTreeSelect.toProgramme()).toBeNull();
    expect(filterTreeSelect.toParams()).toEqual({});
    expect(filterTreeSelect.translateParams()).toEqual([]);

    filterTreeSelect.value = ['7'];
    expect(filterTreeSelect.toProgramme()).toBe('7');
    expect(filterTreeSelect.toParams()).toEqual({ treeSelect: '7' });
    expect(filterTreeSelect.translateParams()).toEqual([
      'treeSelect',
      '',
    ]);

    filterTreeSelect.value = [
      'c',
      'e',
    ];
    expect(filterTreeSelect.toProgramme()).toBe('c,e');
    expect(filterTreeSelect.toParams()).toEqual({ treeSelect: 'c,e' });
    expect(filterTreeSelect.translateParams()).toEqual([
      'treeSelect',
      '3,5',
    ]);

    filterTreeSelect.value = [
      'c',
      'f',
      'e',
    ];
    expect(filterTreeSelect.toProgramme()).toBe('c,f,e');
    expect(filterTreeSelect.toParams()).toEqual({ treeSelect: 'c,f,e' });
    expect(filterTreeSelect.translateParams()).toEqual([
      'treeSelect',
      '3,,5',
    ]);
  });
});
