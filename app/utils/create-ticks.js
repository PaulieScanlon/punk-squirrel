import { formatTick } from './format-tick';

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

export const createTicks = (array, chartWidth, _chartHeight, paddingR, paddingL) => {
  const totalTicks = Math.min(array.length, 30);

  return array
    .filter((_, index) => {
      if (totalTicks === 1) {
        return index === 0 || index === array.length - 1;
      }
      return index % Math.floor(array.length / (totalTicks - 1)) === 0;
    })
    .map((tick, index) => {
      const { date } = tick;

      const x_ratio = index / (totalTicks - 1);
      const x = x_ratio * (chartWidth - paddingR * 2 - paddingL);
      const y = _chartHeight;

      console.log();

      return {
        date: formatTick(date),
        weekend: isWeekend(date),
        x: x + 45 + paddingL,
        y: y + 45,
      };
    });
};
