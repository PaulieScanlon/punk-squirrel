export const createBarChartProperties = (array, chartWidth, _chartHeight, maxValue, paddingL, paddingR, paddingY) => {
  const total = array.length;
  let gap = 10;
  let width = (chartWidth - paddingL - paddingR - (total - 1) * gap) / total;

  // Check if the calculated width is less than or equal to 0
  if (width <= 0) {
    // If so, calculate the width to ensure it's at least 1
    width = 1;
    // Recalculate the gap
    gap = (chartWidth - paddingL - paddingR - total * width) / (total - 1);
  }

  const results = array.map((entry, index) => {
    const { count } = entry;
    const _count = count < 1 ? 0.1 : count;
    const x = index * (width + gap) + paddingL;
    const y_ratio = _count / maxValue;
    const y = _chartHeight - y_ratio * (_chartHeight - paddingY);
    const height = y_ratio * (_chartHeight - paddingY);

    return {
      count,
      x,
      y,
      width,
      height,
    };
  });

  return results;
};
