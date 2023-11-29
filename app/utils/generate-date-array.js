import { formatDate } from './format-date';

export const generateDateArray = () => {
  const currentDate = new Date();
  const fourteenDaysAgo = new Date(currentDate);
  fourteenDaysAgo.setDate(currentDate.getDate() - 14);

  const dateArray = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(fourteenDaysAgo);
    date.setDate(fourteenDaysAgo.getDate() + index);
    return { date: formatDate(date), count: 0 };
  });

  return dateArray;
};
