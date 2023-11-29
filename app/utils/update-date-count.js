import { formatDate } from './format-date';

export const updateDateCount = (sourceDates, defaultDates) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  //   const isDateInside7Days = (date) => new Date(date) >= sevenDaysAgo;

  //   const datesInside7Days = defaultDates.filter(({ date }) => isDateInside7Days(date));
  //   const datesOutside7Days = defaultDates.filter(({ date }) => !isDateInside7Days(date));

  const sourceDateFormatted = (date) => formatDate(new Date(date.updated_at));

  const updatedDefaultDates = sourceDates.reduce(
    (acc, sourceDate) => {
      const sourceDateFormattedString = sourceDateFormatted(sourceDate);

      const defaultDateIndex = acc.findIndex(({ date }) => date === sourceDateFormattedString);

      if (defaultDateIndex !== -1) {
        acc[defaultDateIndex].count++;
      }

      return acc;
    },
    [...defaultDates]
  );

  //   return { datesInside7Days, datesOutside7Days, updatedDefaultDates };
  return { updatedDefaultDates };
};
