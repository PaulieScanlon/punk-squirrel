export const calculateAnimationDuration = (itemCount) => {
  let duration = 0;

  switch (itemCount) {
    case 60:
      duration = 6;
      break;

    case 30:
      duration = 4;
      break;

    case 14:
      duration = 3;
      break;

    case 7:
      duration = 2;
      break;

    default:
      duration = 2;
      break;
  }

  return duration;
};
