export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const keyValue = item[key];

    if (!result[keyValue]) {
      result[keyValue] = [];
    }

    result[keyValue].push(item);

    return result;
  }, {});
};
