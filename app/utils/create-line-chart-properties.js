export const createLineChartProperties = (array, chartWidth, _chartHeight, maxValue, paddingR, paddingL, paddingY) => {
  return array.map((entry, index) => {
    const { count } = entry;

    const x_ratio = index / (array.length - 1);
    const y_ratio = count / maxValue;
    const x = x_ratio * (chartWidth - paddingR - paddingL);
    const y = _chartHeight - y_ratio * (_chartHeight - paddingY);

    return {
      count,
      x: x + paddingL,
      y,
    };
  });
};
