const prodPeriods = [
  { name: '7 Days', value: 7 },
  { name: '14 Days', value: 14 },
  { name: '30 Days', value: 30 },
  { name: '60 Days', value: 60 },
  { name: '90 Days', value: 90 },
];

const devPeriods = [
  { name: '180 Days', value: 180 },
  { name: '275 Days', value: 275 },
  { name: '364 Days', value: 364 },
];

export const selectPeriods =
  process.env.NODE_ENV === 'development' ? [...prodPeriods, ...devPeriods] : [...prodPeriods];
