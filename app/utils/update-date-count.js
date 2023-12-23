import { formatDate } from './format-date';

export const updateDateCount = (array, defaultDates, countKey) => {
  const startDate = new Date();
  const keys = countKey.split('.');

  startDate.setDate(startDate.getDate() - defaultDates.length);

  const dateRange = array.reduce(
    (items, item) => {
      const date = keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), item);
      const sourceDateFormattedString = formatDate(new Date(date));

      const defaultDateIndex = items.findIndex(({ date }) => date === sourceDateFormattedString);

      if (defaultDateIndex !== -1) {
        items[defaultDateIndex].count++;
      }

      return items;
    },
    [...defaultDates]
  );

  return dateRange;
};
