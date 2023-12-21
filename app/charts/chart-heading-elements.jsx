const ChartHeadingElements = ({ chartWidth, paddingR, color, state, owner, repo, title, dates }) => {
  return (
    <>
      {state ? (
        <g
          style={{
            transform: 'translate(168px, 68px)',
          }}
        >
          <rect
            width={118}
            height={42}
            rx={20}
            ry={20}
            style={{
              fill: color,
              fillOpacity: 0.2,
              strokeWidth: 2,
              stroke: color,
            }}
          />

          <text
            x={59}
            y={29}
            textAnchor='middle'
            style={{
              fill: color,
              fontSize: '1.4rem',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {state}
          </text>
        </g>
      ) : null}

      <text
        x={paddingR / 2}
        y={104}
        style={{
          fill: '#c9d1d9',
          fontSize: '2.2rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 400,
          textTransform: 'capitalize',
        }}
      >
        {title}
      </text>
      <text
        x={paddingR / 2}
        y={190}
        style={{
          fill: '#f0f6fc',
          fontSize: '4.4rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 700,
          textTransform: 'lowercase',
        }}
      >
        {owner} / {repo}
      </text>

      <text
        id='total'
        x={chartWidth - paddingR / 2}
        y={188}
        textAnchor='end'
        style={{
          fill: '#f0f6fc',
          fontSize: '9rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 900,
        }}
      >
        0
      </text>
      <text
        x={chartWidth / 2}
        y={285}
        textAnchor='middle'
        style={{
          fill: '#c9d1d9',
          fontSize: '1.6rem',
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}
      >
        {dates.from} - {dates.to}
        <tspan
          dx={16}
          style={{
            fill: '#7d8590',
            fontSize: '1.8rem',
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >{`(${dates.diff} days)`}</tspan>
      </text>
    </>
  );
};

export default ChartHeadingElements;
