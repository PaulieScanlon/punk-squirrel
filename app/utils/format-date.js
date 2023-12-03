export const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'UTC',
    // weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
