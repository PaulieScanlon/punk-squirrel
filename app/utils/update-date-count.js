import { formatDate } from './format-date';

export const updateDateCount = (sourceDates, defaultDates) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - defaultDates.length);

  const sourceDateFormatted = (date) => formatDate(new Date(date.updated_at));

  const dateRange = sourceDates.reduce(
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

  return { dateRange };
};
