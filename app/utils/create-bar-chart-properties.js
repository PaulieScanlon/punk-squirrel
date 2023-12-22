export const createBarChartProperties = (array, chartWidth, _chartHeight, maxValue, paddingL, paddingY) => {
  const barGap = 20;

  const results = array.map((entry, index) => {
    const { name, count, percentage } = entry;

    const width_ratio = count / maxValue;
    const width = width_ratio * chartWidth;
    const height = (_chartHeight - paddingY) / array.length - 1 - barGap;
    const x = paddingL;
    const y = _chartHeight - barGap * index - height * index;

    return {
      name,
      count,
      percentage,
      width: width === 0 ? 1 : width,
      outline: chartWidth,
      height: height,
      x,
      y,
    };
  });

  return results;
};
