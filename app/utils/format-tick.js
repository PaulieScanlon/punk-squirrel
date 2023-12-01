export const formatTick = (date) => {
  const dateFormat = new Date(date)
    .toLocaleString('en-US', {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'short',
    })
    .split(' ');

  return `${dateFormat[0]} • ${dateFormat[1]}`;
};
