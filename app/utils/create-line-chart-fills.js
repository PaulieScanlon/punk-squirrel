export const createLineChartFills = (array, _chartHeight) => {
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
