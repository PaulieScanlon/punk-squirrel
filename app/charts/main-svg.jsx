import { forwardRef } from 'react';

const MainSvg = forwardRef(({ ratio, children }, ref) => {
  return (
    <svg
      id='main-svg'
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${ratio} 1080`}
      style={{
        background: '#0d1117',
      }}
    >
      {children}
    </svg>
  );
});

export default MainSvg;
