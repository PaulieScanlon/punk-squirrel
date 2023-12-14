import { formatTick } from '../../utils/format-tick';

export const createProperties = (array, chartWidth, _chartHeight, maxValue, paddingX, paddingY) => {
  return array.map((entry, index) => {
    const { count } = entry;

    const x_ratio = index / (array.length - 1);
    const y_ratio = count / maxValue;
    const x = x_ratio * (chartWidth - paddingX) + paddingX / 2;
    const y = _chartHeight - y_ratio * (_chartHeight - paddingY);

    return {
      count,
      x,
      y,
    };
  });
};

export const createPoints = (array) => {
  return array.map((point) => {
    const { x, y } = point;
    return `${x},${y}`;
  });
};

export const createFills = (array, _chartHeight) => {
  const dataArray = array.map((point) => {
    const { x, y } = point;
    return `${x},${y}`;
  });

  // first x, chartHeight - offsetY
  const starValues = [dataArray[0].split(',')[0], _chartHeight];
  // last x, chartHeight + paddingY * 2
  const endValues = [dataArray[dataArray.length - 1].split(',')[0], _chartHeight];

  return [starValues, dataArray, endValues].toString();
};

export const createTicks = (array, chartWidth, _chartHeight, paddingX) => {
  return array.map((tick, index) => {
    const { date } = tick;

    const x_ratio = index / (array.length - 1);
    const x = x_ratio * (chartWidth - paddingX) + paddingX / 2;
    const y = _chartHeight;

    return {
      date: formatTick(date),
      x: x + 20,
      y: y + 45,
    };
  });
};
