export const groupByString = (array, key) => {
  const result = array.reduce((items, item) => {
    const keyValue = item[key];

    if (!items[keyValue]) {
      items[keyValue] = [];
    }

    items[keyValue].push(item);

    return items;
  }, {});

  return result;
};
