export const formatDate = (date, showYear = true) => {
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: showYear ? 'numeric' : undefined,
  });
};
