import { formatDate } from './format-date';

export const generateDateArray = (quantity) => {
  const currentDate = new Date();
  const daysAgo = new Date(currentDate);
  daysAgo.setDate(currentDate.getDate() - quantity);

  const dateArray = Array.from({ length: quantity }, (_, index) => {
    const date = new Date(daysAgo);
    date.setDate(daysAgo.getDate() + index);
    return { date: formatDate(date), count: 0 };
  });

  return dateArray;
};
