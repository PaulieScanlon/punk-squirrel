export const createHorizontalBarChartProperties = (
  array,
  chartWidth,
  _chartHeight,
  maxValue,
  paddingL,
  paddingR,
  paddingY
) => {
  const total = array.length;
  let gap = 10;
  let height = (_chartHeight - paddingY - (total - 1) * gap) / total;
  const minWidth = 1;

  const results = array.map((item, index) => {
    const { count } = item;
    const _count = count < 1 ? 0.1 : count;
    const y = index * (height + gap) + paddingY;
    const w_ratio = _count / maxValue;
    let width = w_ratio * (chartWidth - paddingL - paddingR);

    width = Math.max(width, minWidth);
    return {
      ...item,
      gap,
      x: paddingL,
      y,
      width,
      height,
    };
  });

  return results;
};
