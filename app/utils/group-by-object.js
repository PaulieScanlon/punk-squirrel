export const groupByObject = (data, property) => {
  return Object.values(
    data.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = { [property]: key, data: [] };
      }
      acc[key].data.push(obj);
      return acc;
    }, {})
  );
};

// export const groupByObject = (data, property) => {
//   const result = data.reduce((acc, obj) => {
//     const key = obj[property];
//     if (!acc[key]) {
//       acc[key] = [];
//     }
//     acc[key].push(obj);
//     return acc;
//   }, {});

//   return result;
// };

// export const groupByObject = (data, property) => {
//   return Object.entries(
//     data.reduce((acc, obj) => {
//       const key = obj[property];
//       if (!acc[key]) {
//         acc[key] = [];
//       }
//       acc[key].push(obj);
//       return acc;
//     }, {})
//   ).map(([key, value]) => ({ [property]: key, data: value }));
// };
