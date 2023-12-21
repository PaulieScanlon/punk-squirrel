import { forwardRef } from 'react';

const MainCanvas = forwardRef(({ chartWidth, chartHeight }, ref) => {
  return (
    <canvas
      ref={ref}
      className='hidden'
      width={chartWidth}
      height={chartHeight}
      style={{
        background: '#0d1117',
      }}
    />
  );
});

export default MainCanvas;
