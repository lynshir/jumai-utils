import { FilterItems, validParams } from '../filterItems';
import { describe, test, expect } from 'vitest';

describe('filterItems', () => {
  test('validParams', () => {
    // @ts-ignore
    expect(() => validParams([{ type: 'a' }])).toThrow();

    expect(() => validParams([{ type: 'input' }])).toThrow();

    expect(() => validParams([
      {
        type: 'input',
        field: 'a',
      },
    ])).toThrow();

    expect(() => validParams([
      {
        type: 'input',
        field: 'a',
        label: 'a',
      },
      {
        type: 'input',
        field: 'a',
        label: 'b',
      },
    ])).toThrow();

    expect(() => validParams([
      {
        type: 'input',
        field: 'a',
        label: 'a',
      },
      {
        type: 'input',
        field: 'b',
        label: 'a',
      },
    ])).toThrow();
  });

  test('init swap addItem addDict getFilterItem', () => {
    const filterItems = new FilterItems({
      dict: {
        select: [
          {
            value: 'a',
            label: '1',
          },
          {
            value: 'b',
            label: '2',
          },
        ],
      },
      filterItems: [
        {
          type: 'input',
          field: 'input',
          label: 'input',
        },
        {
          type: 'select',
          field: 'select',
          label: 'select',
        },
      ],
    });

    expect(filterItems.dict).toEqual({
      select: [
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

    expect(filterItems.originData.length).toBe(2);
    expect(filterItems.actualData.length).toBe(2);

    expect(filterItems.originData[0].field).toBe('input');
    expect(filterItems.originData[1].field).toBe('select');
    expect(filterItems.originData[0].isDynamic).toBeFalsy();
    expect(filterItems.originData[1].isDynamic).toBeFalsy();

    filterItems.addItem([
      {
        type: 'radio',
        field: 'radio',
        label: 'radio',
      },
    ]);
    expect(filterItems.originData[2].field).toBe('radio');
    expect(filterItems.originData[2].isDynamic).toBeTruthy();

    filterItems.addDict({
      select: [
        {
          value: 'a',
          label: '1',
        },
      ],
    });

    expect(filterItems.getFilterItem('select').data).toEqual([
      {
        value: 'a',
        label: '1',
      },
    ]);
  });

  test('connect validator updateFilterItem', async() => {
    const filterItems = new FilterItems({
      dict: {
        select: [
          {
            value: 'a',
            label: '1',
          },
          {
            value: 'b',
            label: '2',
          },
        ],
      },
      filterItems: [
        {
          type: 'input',
          field: 'input',
          label: 'input',
          required: true,
        },
        {
          type: 'select',
          field: 'select',
          label: 'select',
        },
      ],
    });

    await expect(filterItems.validator()).rejects.toMatch(/请/);

    filterItems.updateFilterItem([
      {
        type: 'input',
        field: 'input',
        value: 'a',
      },
    ]);

    expect(filterItems.validator()).resolves.toBe('');

    filterItems.connect({
      age: 18,
      toParams() {
        return this.age > 0 ? { age: `${this.age }` } : {};
      },
      validator() {
        return this.age > 0 ? Promise.resolve('') : Promise.reject('请输入age');
      },
      reset() {
        this.age = 0;
      },
    });

    await expect(filterItems.validator()).resolves.toBe('');
    expect(filterItems.params).toEqual({
      age: '18',
      input: 'a',
    });

    filterItems.reset();
    await expect(filterItems.validator()).rejects.toMatch(/请/);
    expect(filterItems.params).toEqual({});

    filterItems.updateFilterItem([
      {
        type: 'input',
        field: 'input',
        required: false,
      },
    ]);

    await expect(filterItems.validator()).rejects.toMatch(/请/);
    expect(filterItems.params).toEqual({});
  });

  test('params translateParamsList translateParams', () => {
    const filterItems = new FilterItems({
      filterItems: [
        {
          type: 'select',
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
          value: [
            'a',
            'b',
          ],
        },
        {
          type: 'treeSelect',
          field: 'treeSelect',
          label: 'treeSelect',
          value: [
            'b',
            'c',
          ],
          treeData: [
            {
              value: 'a',
              title: '1',
              label: '1',
              children: [
                {
                  value: 'b',
                  label: '2',
                  title: '2',
                },
              ],
            },
            {
              value: 'c',
              label: '3',
              title: '3',
            },
          ],
        },
      ],
    });

    expect(filterItems.params).toEqual({
      select: 'a,b',
      treeSelect: 'b,c',
    });

    expect(filterItems.translateParamsList).toEqual([
      [
        'select',
        '1,2',
      ],
      [
        'treeSelect',
        '2,3',
      ],
    ]);

    expect(filterItems.translateParams).toEqual([
      'select:1,2',
      'treeSelect:2,3',
    ]);
  });
});
