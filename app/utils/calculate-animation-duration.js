export const calculateAnimationDuration = (itemCount) => {
  let duration = 0;

  switch (itemCount) {
    case 364:
      duration = 12;
      break;

    case 275:
      duration = 10;
      break;

    case 180:
      duration = 9;
      break;

    case 90:
      duration = 8;
      break;

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
