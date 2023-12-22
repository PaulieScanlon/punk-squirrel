export const generateEventTypesArray = (eventTypes) => {
  return Object.values(eventTypes).map((eventType) => ({
    name: eventType,
    count: 0,
  }));
};
