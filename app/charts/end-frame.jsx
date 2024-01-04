const EndFrame = ({ chartWidth, chartHeight }) => {
  return (
    <>
      <rect
        id='endframe-null'
        x={0}
        y={0}
        width={0}
        height={0}
        style={{
          fill: 'none',
          stroke: 'none',
          opacity: 0,
        }}
      />
      <rect
        id='endframe-bg'
        x={0}
        y={0}
        width={chartWidth}
        height={chartHeight}
        style={{
          fill: '#0d1117',
          stroke: 'none',
          opacity: 0,
        }}
      />
      <g
        id='endframe-logo'
        style={{
          transform: `translate(${chartWidth / 2 - 20}px, ${440}px) scale(10)`,
          transformOrigin: 'center',
          transformBox: 'fill-box',
          opacity: 0,
        }}
      >
        <path
          style={{
            fill: '#02e9a7',
          }}
          d='M17.38,8.15c-1.17-3.17-5.26-4.59-9.12-3.16s-6.05,5.16-4.87,8.33l1.81-0.67l-1.43,0.79l0.74,2
            l3.86-0.85l-2.64,1.22l0.63,1.7l4.61-1.01l-3.27,1.68l0.52,1.4l4.57-1l-3.21,1.71l0.41,1.1l4.48-0.98L13.1,21.4l1.56,2.26L15,21.49
            l2.41-1.68L17,18.7l-2.86,0.63l3.52-1.78l-0.52-1.4l-3.06,0.67l3.74-1.79l-0.63-1.7l-2.22,0.49l3.01-1.3l-0.74-2l-6.5,1.42
            L17.38,8.15z'
        />
        <path
          style={{
            fill: '#02e9a7',
          }}
          d='M8.15,4.69C8.65,4.5,8.92,3.93,8.73,3.43L7.89,1.16C7.7,0.66,7.14,0.4,6.63,0.58
            S5.86,1.34,6.05,1.85l0.84,2.26C7.07,4.62,7.64,4.88,8.15,4.69z'
        />
        <path
          style={{
            fill: '#f21cca',
          }}
          d='M20.38,8.23c-1.17-3.17-5.26-4.59-9.12-3.16s-6.05,5.16-4.87,8.33l1.81-0.67l-1.43,0.79l0.74,2
            l3.86-0.85l-2.64,1.22l0.63,1.7l4.61-1.01l-3.27,1.68l0.52,1.4l4.57-1l-3.21,1.71l0.41,1.1l4.48-0.98l-1.38,0.95l1.56,2.26
            l0.34-2.17l2.41-1.68l-0.41-1.1l-2.86,0.63l3.52-1.78l-0.52-1.4l-3.06,0.67l3.74-1.79l-0.63-1.7l-2.22,0.49l3.01-1.3l-0.74-2
            L13.72,12L20.38,8.23z'
        />
        <path
          style={{
            fill: '#f21cca',
          }}
          d='M11.14,4.77c0.51-0.19,0.77-0.76,0.58-1.26l-0.84-2.26c-0.19-0.51-0.76-0.77-1.26-0.58
            S8.86,1.42,9.04,1.92l0.84,2.26C10.07,4.69,10.64,4.96,11.14,4.77z'
        />
        <path
          style={{
            fill: '#f0f6fc',
          }}
          d='M18.92,7.9c-1.17-3.17-5.26-4.59-9.12-3.16S3.74,9.9,4.92,13.07l1.81-0.67L5.3,13.19l0.74,2
            l3.86-0.85l-2.64,1.22l0.63,1.7l4.61-1.01l-3.27,1.68l0.52,1.4l4.57-1l-3.21,1.71l0.41,1.1L16,20.19l-1.38,0.95l1.56,2.26
            l0.34-2.17l2.41-1.68l-0.41-1.1l-2.86,0.63l3.52-1.78l-0.52-1.4l-3.06,0.67l3.74-1.79l-0.63-1.7l-2.22,0.49l3.01-1.3l-0.74-2
            l-6.5,1.42L18.92,7.9z'
        />
        <path
          style={{
            fill: '#f0f6fc',
          }}
          d='M9.68,4.43c0.51-0.19,0.77-0.76,0.58-1.26L9.42,0.91C9.24,0.4,8.67,0.14,8.16,0.33
            C7.66,0.51,7.39,1.08,7.58,1.59l0.84,2.26C8.61,4.36,9.17,4.62,9.68,4.43z'
        />
      </g>
      <text
        id='endframe-title'
        x={chartWidth / 2}
        y={680}
        textAnchor='middle'
        style={{
          fill: '#f0f6fc',
          fontSize: '5rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 900,
          opacity: 0,
        }}
      >
        Punk Squirrel
      </text>
      <text
        id='endframe-url'
        x={chartWidth / 2}
        y={740}
        textAnchor='middle'
        style={{
          fill: '#f0f6fc',
          fontSize: '2rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 400,
          opacity: 0,
        }}
      >
        www.punksquirrel.app
      </text>
    </>
  );
};

export default EndFrame;
