export const findTotalValue = (array, value) => {
  return array.reduce((total, item) => total + item[value], 0);
};
