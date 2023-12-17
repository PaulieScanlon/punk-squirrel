export const calculateAnimationDuration = (itemCount) => {
  const baseItemCount = 30;
  const baseDuration = 6;

  const ratio = itemCount / baseItemCount;

  const adjustedDuration = baseDuration * ratio;

  return adjustedDuration;
};
