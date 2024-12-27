import moment from 'moment';
import { FilterDateStartOrEnd, formatTime } from '../filterDate/filterDateStartOrEnd';
import { describe, test, expect } from 'vitest';

describe('dateStartOrEnd', () => {
  test('init', () => {
    const filterDateStartOrEnd = new FilterDateStartOrEnd({
      field: 'dateStart',
      label: 'dateStart',
    });

    expect(filterDateStartOrEnd.value).toBeNull();

    filterDateStartOrEnd.value = moment();
    filterDateStartOrEnd.reset();
    expect(filterDateStartOrEnd.value).toBeNull();
    expect(filterDateStartOrEnd.placeholder).toBe('开始时间');
  });

  test('formatValue', () => {
    const filterDateStartOrEnd = new FilterDateStartOrEnd({
      field: 'dateStart',
      label: 'dateStart',
    });

    filterDateStartOrEnd.formatValue(null);
    expect(filterDateStartOrEnd.value).toBeNull();

    filterDateStartOrEnd.formatValue('2021-12-30 11:11:11');
    expect(filterDateStartOrEnd.value).not.toBeNull();

    filterDateStartOrEnd.formatValue(moment('2021-12-30 11:11:11'));
    expect(filterDateStartOrEnd.value).not.toBeNull();
  });

  test('formatTime', () => {
    const startTimeStr = '2021-12-29 11:11:11';

    expect(formatTime('dateStart', null, 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm:ss')).toBe('');

    expect(formatTime('dateStart', moment(startTimeStr), 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm:ss')).toBe(startTimeStr);
    expect(formatTime('dateStart', moment(startTimeStr), 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD')).toBe('2021-12-29');
    expect(formatTime('dateStart', moment(startTimeStr), 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss')).toBe('2021-12-29 00:00:00');
    expect(formatTime('dateStart', moment(startTimeStr), 'YYYY-MM-DD', 'YYYY-MM-DD')).toBe('2021-12-29');

    expect(formatTime('dateEnd', moment(startTimeStr), 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm:ss')).toBe(startTimeStr);
    expect(formatTime('dateEnd', moment(startTimeStr), 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD')).toBe('2021-12-29');
    expect(formatTime('dateEnd', moment(startTimeStr), 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss')).toBe('2021-12-29 23:59:59');
    expect(formatTime('dateEnd', moment(startTimeStr), 'YYYY-MM-DD', 'YYYY-MM-DD')).toBe('2021-12-29');
  });

  test('toProgramme toParams translateParams', () => {
    const startTimeStr = '2021-12-29 11:11:11';
    const filterDateStartOrEnd = new FilterDateStartOrEnd({
      field: 'dateStart',
      label: 'dateStart',
      type: 'dateStart',
    });

    expect(filterDateStartOrEnd.toProgramme()).toBeNull();
    expect(filterDateStartOrEnd.toParams()).toEqual({});
    expect(filterDateStartOrEnd.translateParams()).toEqual([]);

    filterDateStartOrEnd.value = moment(startTimeStr);
    expect(filterDateStartOrEnd.toProgramme()).toBe(startTimeStr);
    expect(filterDateStartOrEnd.toParams()).toEqual({ dateStart: startTimeStr });
    expect(filterDateStartOrEnd.translateParams()).toEqual([
      'dateStart',
      startTimeStr,
    ]);
  });
});
