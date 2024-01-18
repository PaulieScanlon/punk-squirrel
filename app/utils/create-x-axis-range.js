export const createXAxisRange = (data, numRanges, key) => {
  const values = key ? data.map((item) => item[key]) : data;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const rangeSize = (maxValue - minValue) / numRanges;

  const range = Array.from({ length: numRanges + 1 }, (_, index) => Math.round(minValue + index * rangeSize));

  return range.sort((a, b) => a - b);
};
