const DateTicks = ({ ticks }) => {
  return (
    <>
      {ticks.map((tick, index) => {
        const { date, x, y, weekend } = tick;

        return (
          <g
            key={index}
            className='date'
            style={{
              transform: 'translateX(-20px)',
              opacity: 0,
            }}
          >
            <text
              x={x}
              y={y}
              textAnchor='middle'
              style={{
                fill: weekend ? '#49525e' : '#7d8590',
                fontSize: '1.2rem',
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 600,
                transform: 'rotate(45deg)',
                transformBox: 'content-box',
              }}
            >
              {date}
            </text>
          </g>
        );
      })}
    </>
  );
};

export default DateTicks;
