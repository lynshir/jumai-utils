import React from 'react';

function formatTimeStamp(timeStamp: string | number): string {
  if (!timeStamp) {
    return '';
  }

  const date = new Date(timeStamp);
  const ydm = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ].map((el) => String(el)
    .padStart(2, '0'))
    .join('-');

  const hms = [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((el) => String(el)
    .padStart(2, '0'))
    .join(':');

  return `${ydm} ${hms}`;
}

export function TimeStampFormatter({ value }: { value: number | string; }) {
  return (
    <div
      style={{ textAlign: 'left' }}
      title={formatTimeStamp(value)}
    >
      {formatTimeStamp(value)}
    </div>
  );
}
