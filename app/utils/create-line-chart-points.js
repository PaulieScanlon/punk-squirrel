export const createLineChartPoints = (array) => {
  return array.map((point) => {
    const { x, y } = point;
    return `${x},${y}`;
  });
};
