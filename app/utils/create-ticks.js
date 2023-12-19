import { formatTick } from './format-tick';

export const createTicks = (array, chartWidth, _chartHeight, paddingR, paddingL) => {
  return array.map((tick, index) => {
    const { date } = tick;

    const x_ratio = index / (array.length - 1);
    const x = x_ratio * (chartWidth - paddingR - paddingL);
    const y = _chartHeight;

    return {
      date: formatTick(date),
      x: x + 20 + paddingL,
      y: y + 45,
    };
  });
};
