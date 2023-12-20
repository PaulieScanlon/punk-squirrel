import { formatDate } from './format-date';

export const generateDateArray = (dateFrom, diff) => {
  const startDate = new Date(dateFrom);

  const quantity = Number(diff) + 1;

  const dateArray = Array.from({ length: quantity }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return { date: formatDate(currentDate), count: 0 };
  });

  return dateArray;
};
