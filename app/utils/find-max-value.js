export const findMaxValue = (array, value) => {
  return Math.max(...array.map((item) => item[value]));
};
