import { formatTick } from './format-tick';

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

export const createTicks = (array, chartWidth, _chartHeight, paddingR, paddingL, offsetX) => {
  const totalTicks = Math.min(array.length, 30);

  const result = Array.from({ length: totalTicks }).map((_, index) => {
    const tickIndex = Math.floor((index / (totalTicks - 1)) * (array.length - 1));
    const { date } = array[tickIndex];

    const x_ratio = index / (totalTicks - 1);
    const x = x_ratio * (chartWidth - paddingL - paddingR);
    const y = _chartHeight;

    return {
      date: formatTick(date),
      weekend: isWeekend(date),
      x: x + paddingL + offsetX / 6,
      y: y + 45,
    };
  });

  return result;
};
