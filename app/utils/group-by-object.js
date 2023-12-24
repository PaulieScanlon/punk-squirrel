const keyExtractor = (obj, key) => {
  const keys = key.split('.');
  return keys.reduce((result, currentKey) => result[currentKey], obj);
};

export const groupByObject = (data, key) => {
  const result = Object.values(
    data.reduce((items, item) => {
      const groupByKey = keyExtractor(item, key);
      items[groupByKey] = items[groupByKey] || [];
      items[groupByKey].push(item);
      return items;
    }, {})
  );

  // return result.map((group) => ({
  //   [keyExtractor(group[0], key)]: group.reduce((acc, item) => ({ ...acc, ...item }), {}),
  // }));
  return result.map((group) => ({
    [keyExtractor(group[0], key)]: group[0], // Modify this line to use group[0] directly
  }));
};
