export const updateEventsCount = (data, defaultEvents) => {
  const totalEvents = data.length;

  const results = defaultEvents.map((eventCounter) => {
    const eventType = eventCounter.name;

    const eventCount = data.reduce((count, event) => {
      return count + (event.type === eventType ? 1 : 0);
    }, 0);

    // there's only ever gonna be 100 results
    const percentage = Math.round(totalEvents > 0 ? (eventCount / totalEvents) * 100 : 0);

    return {
      ...eventCounter,
      count: eventCount,
      percentage: `${percentage}%`,
    };
  });

  console.log(results);

  return results;
};
